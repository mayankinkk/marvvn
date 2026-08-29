import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `You are MARVVN's AI shopping assistant. You help customers with:
- Finding products and recommendations
- Order tracking (ask for order ID)
- Return & refund policy questions
- Shipping & delivery info
- Size recommendations
- General store questions

BRAND INFO:
- MARVVN is a premium streetwear brand. Tagline: "NOT MADE TO FIT IN | BUILT FOR THE REAL ONES"
- Founded in India, luxury streetwear for men and women
- Email: marvvnclothing@gmail.com
- Phone: 7578017237
- Based in Faridabad, India
- WhatsApp: +91 7578017237

PRODUCTS:
- Oversized T-shirts: ₹899–₹1,299 (compare at ₹1,199–₹1,599)
- Joggers: ₹1,299–₹1,499 (compare at ₹1,599–₹1,899)
- Cargos: ₹1,499–₹1,699 (compare at ₹1,799–₹1,999)
- Hoodies: ₹2,199–₹2,999 (compare at ₹2,499–₹3,199)
- Sweatshirts: ₹1,999–₹2,499
- Caps/Accessories: ₹599–₹799
- Jackets: ₹2,299–₹2,999

SHIPPING:
- Free shipping on orders above ₹999
- Shipping fee: ₹99 for orders below ₹999
- Ships within 48 hours
- Delivery: 5-7 business days (India)

RETURN & REFUND POLICY:
- Returns accepted within 3 DAYS of delivery only
- Products must be unused, unworn, unwashed, original condition
- Must return with original tags, packaging, accessories
- Only product price refunded, shipping charges non-refundable
- Damaged/used products NOT accepted
- Must contact within 24 hours if received damaged (with photos/videos)
- No exchanges — refund only
- MARVVN reserves right to reject returns that don't meet conditions

SIZES AVAILABLE:
- Oversized T-shirts: XS, S, M, L, XL, XXL (Unisex)
- Joggers/Cargos: S, M, L, XL, XXL
- Jeans: 28, 30, 32, 34, 36

COLLECTIONS:
- Freestyle Collection
- Summer Society
- Drift Collection
- Delulu Collection
- The Lifting Club
- Sigilism Collection
- MARVVN SkyClub
- Polyamide Collection

COLLABORATIONS:
- Marvel, HotWheels, Red Bull, Harry Potter, Naruto, Disney, DC, Looney Tunes, SpongeBob, Hello Kitty, Playboy

SIZE RECOMMENDATIONS:
- If between sizes, go one size up for oversized look
- XS fits true to size for XS wearers
- Most tees are unisex, women can size down for fitted look

RULES:
- Be concise and friendly. Use short messages.
- Always recommend checking size chart for specific fit questions
- For order tracking, ask for order ID
- For returns, remind about the 3-day window
- Don't make up products or prices — only mention what's listed above
- If unsure, suggest contacting support via WhatsApp or email
- Use emojis sparingly (1-2 per message max)
- If customer asks about a specific product, guide them to the website
- Never share internal pricing, costs, or margins`

export async function POST(request: Request) {
  try {
    const { message, history = [] } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Chat service not configured' }, { status: 500 })
    }

    const supabase = createClient()

    let productContext = ''
    try {
      const { data: products } = await supabase
        .from('products')
        .select('title, handle, price, compare_at_price, category, collection, sizes, colors, is_new, is_bestseller')
        .order('created_at', { ascending: false })
        .limit(50)

      if (products && products.length > 0) {
        const productList = products.map((p: any) =>
          `${p.title} | ₹${p.price}${p.compare_at_price ? ` (was ₹${p.compare_at_price})` : ''} | ${p.category} | Sizes: ${(p.sizes || []).join(',')} | Colors: ${(p.colors || []).join(',')}${p.is_new ? ' | NEW' : ''}${p.is_bestseller ? ' | BESTSELLER' : ''}`
        ).join('\n')
        productContext = `\n\nCURRENT PRODUCT CATALOG (show these when customers ask for products):\n${productList}`
      }
    } catch {}

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT + productContext,
    })

    const chat = model.startChat({
      history: history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.7,
      },
    })

    const result = await chat.sendMessage(message)
    const response = result.response.text()

    return NextResponse.json({ reply: response })
  } catch (error: any) {
    console.error('Chat error:', error?.message)
    return NextResponse.json(
      { reply: "Sorry, I'm having trouble right now. Please try again or reach us on WhatsApp at +91 7578017237 📱" },
      { status: 200 }
    )
  }
}

import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rl = await rateLimit(`chat:${ip}`, 20, 60000)
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many messages. Please slow down.' }, { status: 429 })
    }

    const { message, history = [] } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ reply: 'Chat service is not configured yet. Please WhatsApp us at +91 7578017237 📱' })
    }

    let productList = ''
    try {
      const supabase = createClient()
      const { data: products } = await supabase
        .from('products')
        .select('title, handle, price, compare_at_price, category, collection, sizes, colors, is_new, is_bestseller, badge')
        .order('created_at', { ascending: false })
        .limit(60)

      if (products && products.length > 0) {
        productList = products.map((p: any) =>
          `- ${p.title} (₹${p.price}${p.compare_at_price ? `, was ₹${p.compare_at_price}` : ''}) | ${p.category} | Sizes: ${(p.sizes || []).join(',')} | Colors: ${(p.colors || []).join(',')}${p.is_new ? ' | NEW' : ''}${p.is_bestseller ? ' | BESTSELLER' : ''}`
        ).join('\n')
      }
    } catch {}

    const systemInstruction = `You are MARVVN's friendly shopping assistant. Answer the customer's question directly and helpfully. Be conversational, warm, and concise — like a helpful store employee.

ABOUT MARVVN:
- Premium unisex streetwear brand from India
- Tagline: "NOT MADE TO FIT IN | BUILT FOR THE REAL ONES"
- Website: marvvn.online
- WhatsApp: +91 7578017237
- Email: marvvnclothing@gmail.com

PRODUCT CATALOG:
${productList || 'Check marvvn.online for our latest collection.'}

PRICING:
- Oversized T-shirts: ₹899–₹1,299
- Joggers: ₹1,299–₹1,499
- Cargos: ₹1,499–₹1,699
- Hoodies: ₹2,199–₹2,999
- Sweatshirts: ₹1,999–₹2,499
- Caps & Accessories: ₹599–₹799
- Jackets: ₹2,299–₹2,999

SHIPPING:
- Free shipping on orders above ₹999
- ₹65 shipping fee for orders below ₹999
- Ships within 48 hours
 - Delivery in 7-10 business days across India

RETURN POLICY (important — be clear about this):
- Returns accepted within 3 DAYS of delivery ONLY — not 7 days, not 5 days, exactly 3 days
- Product must be unused, unworn, unwashed, with original tags and packaging
- Only product price refunded — shipping charges are NOT refundable
- Damaged or used items will NOT be accepted
- If you received a damaged item, contact us within 24 hours with photos/videos
- No exchanges — refund only
- Contact WhatsApp: +91 7578017237

SIZES:
- T-shirts: XS, S, M, L, XL, XXL (unisex)
- Joggers/Cargos: S, M, L, XL, XXL
- Between sizes? Go one up for the oversized streetwear look
- Women can size down from unisex sizes for a fitted look

COLLECTIONS: Freestyle, Summer Society, Drift, Delulu, The Lifting Club, Sigilism, MARVVN SkyClub, Polyamide
COLLABORATIONS: Marvel, HotWheels, Red Bull, Harry Potter, Naruto, Disney, DC, Looney Tunes, SpongeBob, Hello Kitty, Playboy

CONTACT & BRAND INFO:
- Official Email: marvvnclothing@gmail.com
- WhatsApp: +91 7578017237
- If asked about the owner, founders, company, or partnerships: state that MARVVN is an independent streetwear clothing brand, and provide our email marvvnclothing@gmail.com or WhatsApp.
- NEVER mention or invent any other email address.

HOW TO RESPOND:
- Answer the customer's question directly — don't dodge it
- If they ask about a product, mention the name, price, and available sizes/colors
- If they ask about returns, clearly state the 3-day window
- If they ask about shipping, mention free shipping above ₹999
- If they ask to track an order, ask for their order ID
- If they ask something you don't know, say "Let me connect you with our team on WhatsApp" and share the number
- Keep replies to 2-4 sentences max unless they need detailed info
- Use 1-2 emojis max per message
- Be warm but not over-the-top
- Never say "I don't have access to that info" — always try to help or redirect to WhatsApp`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      systemInstruction,
    })

    // Gemini requires chat history to start with a 'user' message.
    // The frontend sends the initial bot greeting first (role: 'assistant'),
    // so we drop all leading model messages before passing to startChat.
    const trimmedHistory = history.slice()
    while (trimmedHistory.length > 0 && trimmedHistory[0].role !== 'user') {
      trimmedHistory.shift()
    }

    const chatHistory = trimmedHistory.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }))

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    })

    const result = await chat.sendMessage(message)
    const response = result.response.text()

    return NextResponse.json({ reply: response })
  } catch (error: any) {
    console.error('Chat API error:', error?.message || error?.status || 'unknown')
    return NextResponse.json({
      reply: `Sorry, I'm having trouble right now. Please try again or reach us on WhatsApp at +91 7578017237 📱`,
    })
  }
}

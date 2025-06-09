// const dotenv = require('dotenv').config(); // tas bort
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: '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' });

const blogsDir = path.join(__dirname, '../chatbot/public/BLOGS');
const productsDir = path.join(__dirname, '../chatbot/public/PRODUCTS');

// Product data structure
const products = {
  'cleanser': {
    name: 'Cleanser',
    url: 'https://1753skincare.se/products/cleanser',
    description: 'Vår mjuka rengöringsmjölk som rengör huden utan att störa dess naturliga balans.'
  },
  'toner': {
    name: 'Toner',
    url: 'https://1753skincare.se/products/toner',
    description: 'En lätt och uppfriskande toner som återställer hudens pH-balans.'
  },
  'serum': {
    name: 'Serum',
    url: 'https://1753skincare.se/products/serum',
    description: 'Ett näringsrikt serum som ger huden allt den behöver för att trivas.'
  },
  'moisturizer': {
    name: 'Moisturizer',
    url: 'https://1753skincare.se/products/moisturizer',
    description: 'En rik och mjukgörande kräm som skyddar och återställer hudens barriär.'
  }
};

function findRelevantBlogSnippets(query, maxSnippets = 5) {
  const files = fs.readdirSync(blogsDir).filter(f => f.endsWith('.txt'));
  let results = [];
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  for (const file of files) {
    const content = fs.readFileSync(path.join(blogsDir, file), 'utf8');
    const paragraphs = content.split(/\n{2,}/);
    for (const para of paragraphs) {
      let score = 0;
      for (const word of words) {
        if (para.toLowerCase().includes(word)) score++;
      }
      if (score > 0) {
        results.push({ file, para, score });
      }
    }
  }
  // Sortera på flest träffar
  results.sort((a, b) => b.score - a.score);
  // Om inga träffar, ta första stycket från de tre första bloggarna
  if (results.length === 0) {
    for (let i = 0; i < Math.min(3, files.length); i++) {
      const content = fs.readFileSync(path.join(blogsDir, files[i]), 'utf8');
      const firstPara = content.split(/\n{2,}/)[0];
      results.push({ file: files[i], para: firstPara, score: 0 });
    }
  }
  return results.slice(0, maxSnippets);
}

function findRelevantProducts(query) {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  let results = [];
  
  for (const [key, product] of Object.entries(products)) {
    let score = 0;
    const productText = `${product.name} ${product.description}`.toLowerCase();
    
    for (const word of words) {
      if (productText.includes(word)) score++;
    }
    
    if (score > 0) {
      results.push({ ...product, score });
    }
  }
  
  return results.sort((a, b) => b.score - a.score);
}

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  // Special handling for e-book question
  if (message.toLowerCase().includes('e-bok') || message.toLowerCase().includes('ebook') || message.toLowerCase().includes('ladda hem')) {
    return res.json({ 
      reply: "Vår kostnadsfria e-bok hittar du på **www.1753skincare.se/e-boken** 📚✨\n\nDen innehåller 140 sidor med allt du behöver veta om hud, hudvård och hudhälsa ur ett holistiskt perspektiv. Perfekt för dig som vill fördjupa dig i hur du kan ta hand om din hud på det mest naturliga sättet!" 
    });
  }

  const snippets = findRelevantBlogSnippets(message, 5);
  const relevantProducts = findRelevantProducts(message);
  const context = snippets.map(s => `Från ${s.file}:\n${s.para}`).join('\n---\n');
  
  // Add product information to context if relevant products were found
  if (relevantProducts.length > 0) {
    const productInfo = relevantProducts.map(p => 
      `Produkt: ${p.name}\nBeskrivning: ${p.description}\nLänk: ${p.url}`
    ).join('\n---\n');
    context += '\n\nRelevanta produkter:\n' + productInfo;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Du är en världsledande holistisk hudterapeut och expert på hudvård.\n\nDu får ENBART rekommendera 1753 Skincare-produkter och vår rekommenderade hudvårdsrutin.\nDu får INTE rekommendera traditionell hudvård eller produkter/ingredienser som inte finns i vårt sortiment.\nOm kunden frågar om ämnen eller ingredienser som inte finns i våra produkter, svara: \'Det kan absolut ge kortsiktiga resultat men vår inställning är att alla ämnen som vi lägger på huden som inte naturligt ska finnas där riskerar att rubba balansen i hudens naturliga ekosystem (mikrober, signalsystem och hudceller).\'\n\nOm kunden frågar om vår e-bok, hänvisa ALLTID till: www.1753skincare.se/e-boken\n\nNär du rekommenderar produkter, använd följande format för länkar: [Produktnamn](produktlänk)\n\nOm du hittar relevant information i kunskapsbasen nedan, använd den för att ge ett så hjälpsamt och inspirerande svar som möjligt. Om inget relevant finns, svara ändå så gott du kan utifrån din expertis men håll dig alltid till 1753 Skincare:s filosofi och produkter.\nSvara endast på hudvårdsrelaterade frågor, annars hänvisa till christopher@1753skincare.com.\n\nKUNSKAPSBAS:\n${context}`
        },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OpenAI error', details: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
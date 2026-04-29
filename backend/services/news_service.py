import aiohttp
from google import genai
from google.genai import types
import asyncio

class NewsService:
    def __init__(self, cryptocompare_key: str, gemini_key: str):
        self.cryptocompare_key = cryptocompare_key
        # Inicialização da nova SDK oficial
        self.client = genai.Client(api_key=gemini_key)
        self.base_url = "https://min-api.cryptocompare.com/data/v2/news/?lang=EN"
        
        # O System Prompt inegociável definido pelo PO
        self.system_instruction = (
            "Você é um sistema de segurança de trading quantitativo focado exclusivamente no Bitcoin. "
            "Sua única função é ler manchetes de notícias recentes e emitir um alerta de risco.\n"
            "Regras de Avaliação:\n"
            "- Procure apenas por catalisadores de alta volatilidade ou risco de ruína (hacks em corretoras, processos da SEC, proibições de governos, falências sistêmicas, guerras).\n"
            "- Ignore notícias técnicas, previsões de preço de analistas, ou desenvolvimentos normais do ecossistema.\n"
            "- Se houver pelo menos UMA ameaça letal ao preço, classifique como DANGER.\n"
            "- Se houver notícias preocupantes que geram incerteza regulatória ou macroeconômica, classifique como CAUTION.\n"
            "- Se as notícias forem neutras, positivas ou irrelevantes para risco de colapso, classifique como SAFE.\n"
            "Regra de Saída (CRÍTICA):\n"
            "Responda ESTRITAMENTE com uma única palavra em maiúsculo: SAFE, CAUTION ou DANGER. "
            "Não adicione pontuação, quebras de linha, justificativas ou formatação Markdown. "
            "Se você falhar nesta regra, o sistema inteiro irá colapsar."
        )

    async def fetch_news(self):
        """Busca notícias e retorna o par (headlines, risk_level)"""
        headers = {"authorization": f"Apikey {self.cryptocompare_key}"}
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.base_url, headers=headers) as resp:
                    if resp.status != 200:
                        return [], "CAUTION"
                    
                    data = await resp.json()
                    news_items = data.get('Data', [])[:10] # Pegamos as 10 mais recentes
                    
                    headlines = [item['title'] for item in news_items]
                    risk_level = await self._analyze_sentiment(headlines)
                    
                    return headlines, risk_level
        except Exception as e:
            print(f">>> ❌ [NewsService] Erro na busca: {e}")
            return [], "CAUTION"

    async def _analyze_sentiment(self, headlines):
        """Consolida notícias e extrai o Risk Level com determinismo absoluto"""
        if not headlines:
            return "CAUTION"

        # Os dados do utilizador (as manchetes) são enviados separadamente das regras
        context = " | ".join(headlines)
        user_prompt = f"Manchetes do Mercado: '{context}'"

        try:
            response = await asyncio.to_thread(
                self.client.models.generate_content,
                model='gemini-2.5-flash',
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=self.system_instruction,
                    temperature=0.0, # ZERO criatividade. Determinismo absoluto.
                )
            )
            
            sentiment = response.text.strip().upper()
            
            # Última barreira de segurança em caso de anomalia extrema
            if "DANGER" in sentiment: return "DANGER"
            if "SAFE" in sentiment: return "SAFE"
            
            # O default seguro é CAUTION
            return "CAUTION"
            
        except Exception as e:
            print(f">>> ❌ [NewsService] Erro Gemini: {e}")
            return "CAUTION"
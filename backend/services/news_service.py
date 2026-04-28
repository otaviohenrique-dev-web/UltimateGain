import aiohttp
import time
from typing import List

class NewsService:
    """Busca de manchetes com sistema anti-rate-limit (Cache)."""
    
    def __init__(self, api_key=""):
        self.api_key = api_key
        self.cached_news = []
        self.last_fetch_ts = 0
    
    async def fetch_news(self, query="BTC", lang="PT") -> List[str]:
        now = time.time()
        
        # Cache de 5 minutos
        if self.last_fetch_ts > 0 and (now - self.last_fetch_ts) < 300:
            return self.cached_news
        
        try:
            url = f"https://min-api.cryptocompare.com/data/v2/news/"
            query_str = str(query) if query else "BTC"
            headers = {}
            if self.api_key:
                headers['authorization'] = f"Apikey {self.api_key}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    url,
                    params={'categories': query_str, 'lang': lang},
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as resp:
                    if resp.status == 200:
                        try:
                            data = await resp.json()
                            # Validar estrutura da resposta
                            if not isinstance(data, dict):
                                print(f">>> ⚠️ [NewsService] Resposta inesperada (não é dict)")
                                return self.cached_news
                            
                            news_data = data.get('Data')
                            
                            # Extrair títulos de forma segura
                            headlines = []
                            
                            # Se Data é um dicionário (chaves são IDs de artigos)
                            if isinstance(news_data, dict):
                                for article_id, item in list(news_data.items())[:10]:
                                    if isinstance(item, dict) and 'title' in item:
                                        headline = item.get('title', '')
                                        if isinstance(headline, str):
                                            headlines.append(headline)
                            # Se Data é uma lista
                            elif isinstance(news_data, list):
                                for item in news_data[:10]:
                                    if isinstance(item, dict) and 'title' in item:
                                        headline = item.get('title', '')
                                        if isinstance(headline, str):
                                            headlines.append(headline)
                            else:
                                print(f">>> ⚠️ [NewsService] Campo 'Data' tipo inesperado: {type(news_data)}")
                                return self.cached_news
                            
                            if headlines:
                                self.cached_news = headlines
                                self.last_fetch_ts = now
                            
                            return self.cached_news
                        except Exception as parse_err:
                            print(f">>> ⚠️ [NewsService] Erro ao parsear JSON: {type(parse_err).__name__}: {parse_err}")
                            return self.cached_news
                    else:
                        print(f">>> ⚠️ [NewsService] Status HTTP {resp.status}")
                        return self.cached_news
        except Exception as e:
            print(f">>> ❌ [NewsService] Erro: {type(e).__name__}: {e}")
        
        
        return self.cached_news
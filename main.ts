interface SearchResult {
  id: string
  label: string
}

async function hltbSearch(search: string): SearchResult | null {
  let body = new URLSearchParams(`t=games&sorthead=popular&sortd=0&plat=&length_type=main&length_min=&length_max=&v=&f=&g=&detail=&randomize=0`)
  body.set('queryString', search)
  console.log('searching', search, body)
  
  let result = await fetch(`https://howlongtobeat.com/search_results?page=1`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    body
  })
  
  let text = await result.text()
  
  let re = /<ul>.*?<li.*?<a aria-label="(.+?)".*?href="game\?id=(\d+?)"/si
  let matches = re.exec(text)
  if (!matches) return null
  
  let [_, label, id] = matches
  return { id, label }
}

interface Details {
  avg: string
}

async function hltbDetails(id: string): Details {
  let result = await fetch(`https://howlongtobeat.com/game?id=${id}`)
  
  let text = await result.text()
  
  let re = /<td>Main Story<\/td>.*?<td.*?<td>(.+?)<\/td>/si
  let matches = re.exec(text)
  if (!matches) return null
  let [_, avg] = matches
  return { avg }
}

async function hltb(search: string): Promise<Response> {
  let searchResult = await hltbSearch(search)
  if (!searchResult)
    return new Response(`Couldn't find ${search}. Soz`)
  
  let details = await hltbDetails(searchResult.id)
  if (!details)
    return new Response(`Couldn't load hltb game=${searchResult.id}. Soz`)
  
  return new Response(`HowLongToBeat for ${searchResult.label} // avg: ${details.avg}. (searched for ${search})`)
}

addEventListener('fetch', event => {
  let path = decodeURIComponent(new URL(event.request.url).pathname.slice(1))
  if (path.startsWith('favicon.ico')) return event.respondWith(new Response('', { status: 404 }))
  
  console.log('fetch listener:', path)
  event.respondWith(hltb(path))
})

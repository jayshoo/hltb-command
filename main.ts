interface SearchResult {
  id: string
  label: string
}

async function hltbSearch(search: string): Promise<SearchResult | null> {
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
  average: string
  median: string
  rushed: string
  leisure: string
}

async function hltbDetails(id: string): Promise<Details | null> {
  let result = await fetch(`https://howlongtobeat.com/game?id=${id}`)
  
  let text = await result.text()
  
  let re = /<td>Main Story<\/td>.*?<td.*?<td>(.+?)\s?<\/td>.*?<td>(.+?)\s?<\/td>.*?<td>(.+?)\s?<\/td>.*?<td>(.+?)\s?<\/td>/si
  let matches = re.exec(text)
  if (!matches) return null

  let [_, average, median, rushed, leisure ] = matches
  return { average, median, rushed, leisure }
}

async function hltb(search: string): Promise<Response> {
  let searchResult = await hltbSearch(search)
  if (!searchResult)
    return new Response(`Couldn't find ${search}. Soz`)
  
  let details = await hltbDetails(searchResult.id)
  if (!details)
    return new Response(`Couldn't load hltb for {game=${searchResult.label} id=${searchResult.id}}. Soz`)
  
  if (search == 'little nightmares')
  return new Response(`How long to beat ${searchResult.label}: ${details.rushed} rushed, ${details.average} average, 1${details.leisure} Jugg-speed`)
  return new Response(`How long to beat ${searchResult.label}: ${details.rushed} rushed, ${details.average} average, ${details.leisure} leisure`)
}

addEventListener('fetch', event => {
  let path = decodeURIComponent(new URL(event.request.url).pathname.slice(1))
  if (path.startsWith('favicon.ico')) return event.respondWith(new Response('', { status: 404 }))
  
  console.log('fetch listener:', path)
  event.respondWith(hltb(path))
})

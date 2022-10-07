interface SearchResult {
  id: string
  label: string
}

async function hltbSearch(search: string): Promise<SearchResult | null> {
  let body = JSON.stringify({
  "searchType": "games",
  "searchTerms": [
    search
  ],
  "searchPage": 1,
  "size": 20,
  "searchOptions": {
    "games": {
      "userId": 0,
      "platform": "",
      "sortCategory": "popular",
      "rangeCategory": "main",
      "rangeTime": {
        "min": 0,
        "max": 0
      },
      "gameplay": {
        "perspective": "",
        "flow": "",
        "genre": ""
      },
      "modifier": ""
    },
    "users": {
      "sortCategory": "postcount"
    },
    "filter": "",
    "sort": 0,
    "randomizer": 0
  }
})
  new URLSearchParams(`t=games&sorthead=popular&sortd=0&plat=&length_type=main&length_min=&length_max=&v=&f=&g=&detail=&randomize=0`)
  body.set('queryString', search)
  console.log('searching', search, body)
  
  let result = await fetch(`https://howlongtobeat.com/api/search`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'referer': 'https://howlongtobeat.com/'
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
  let result = await fetch(`https://howlongtobeat.com/game/${id}`)
  
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
  
  return new Response(`How long to beat ${searchResult.label}: ${details.rushed} rushed, ${details.average} average, ${details.leisure} leisure`)
}

addEventListener('fetch', event => {
  let path = decodeURIComponent(new URL(event.request.url).pathname.slice(1))
  if (path.startsWith('favicon.ico')) return event.respondWith(new Response('', { status: 404 }))
  
  console.log('fetch listener:', path)
  event.respondWith(hltb(path))
})

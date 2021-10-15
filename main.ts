async function hltbSearch(search: string): unknown {
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
  return result
}

async function hltb(search: string): Promise<Response> {
  let result = await hltbSearch(search)
  
  return new Response(result.body)
}

addEventListener('fetch', event => {
  let path = decodeURIComponent(new URL(event.request.url).pathname.slice(1))
  if (path.startsWith('favicon.ico') return event.respondWith(new Response('', { status: 404 }))
  
  console.log('fetch listener:', path)
  event.respondWith(hltb(path))
})

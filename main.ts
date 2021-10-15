import { HowLongToBeatService, HowLongToBeatEntry } from 'howlongtobeat'

let hltbService = new HowLongToBeatService()

async function hltb(search: string): Promise<Response> {
  let result = await hltbService.search(search)
  if (result.length == 0) return new Response(`not found: ${search}`)
  
  return new Response(JSON.stringify(result[0]))
}

addEventListener('fetch', event => {
  let path = new URL(event.request.url).pathname.slice(1)
  console.log('fetch', path)
  event.respondWith(hltb(path))
})

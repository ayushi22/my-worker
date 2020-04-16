addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */

//Defining all constant values to be fetched:
const baseUrl = 'https://cfw-takehome.developers.workers.dev/api/variants'
const new_header = '<title>Ayushi`s Variant</title>';
const new_header_title = 'Ayushi`s Variant';
const new_desc = 'Hello Cloudy! This is Ayushi`s custom description';
const new_url = 'https://www.linkedin.com/in/purohitayushi';
const new_title = 'Interned - Ayushi Purohit';
const new_url_display_text = 'Connect with me here!';

async function handleRequest(request) {
  
  const cookie = request.headers.get('cookie');
  if(cookie && (cookie.indexOf('Variant-2')>-1 || cookie.indexOf('Variant-1')>-1)){
    //Since we already have cookie information, we fetch the link from the cookie details
     let redirectLink = cookie.split(',')[1]
     return(getVariantResponse(1,redirectLink))
  }
  else{
    //New client since we don't have any cookie information
      return(getVariantResponse(0,null))
  }
}

async function getVariantResponse(responseType,url)
{
    var redirectUrl = url
    var redirectedURlResponse = ''
    var group = ''
    if(responseType==0)
    {
      let variantInformation = await fetch(baseUrl)
      let variantJson = await variantInformation.json()
      redirectUrl = Math.random() < 0.5 ? variantJson['variants'][0]: variantJson["variants"][1]
      let variants = variantJson['variants']
      group = redirectUrl == variants[0] ? ('Variant-1,' + variants[0]) : ('Variant-2,' + variants[1]);
    }
    
    redirectedURlResponse = await (await fetch(redirectUrl)).text()
    const rewriter = new HTMLRewriter()
        .on('title',new HeaderRewriter())
        .on('p#description', new ContentWriter())
        .on('h1#title', new ContentWriter())
        .on('a#url', new URLRewriter('href'))
        .on('a#url', new ContentWriter())

    if(responseType == 0){
      return rewriter.transform(new Response(redirectedURlResponse,{
        headers:{'content-type':'text/html','Set-Cookie':`${group}; path=/`}
      }))
    }
    else{
      return rewriter.transform(new Response(redirectedURlResponse,{
        headers:{'content-type':'text/html'}
      }))
    }
}
class HeaderRewriter{
  element(element){
    element.replace(new_header,{html:true})
  }
}
class URLRewriter{
  constructor(attributeName){
    this.attributeName = attributeName
  }
  element(element){
    const attribute = element.getAttribute(this.attributeName)
    if(attribute){
      element.setAttribute(
        this.attributeName,
        new_url
      )
    }
  }
}
class ContentWriter{
  element(element){
    let finalText = element.tagName == 'p'? new_desc : element.tagName == 'h1'? new_title : element.tagName == 'a'? new_url_display_text : 'No new text'
    element.setInnerContent(finalText,{html:true})
  }
}

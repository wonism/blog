var cardTemplate='<div class="post-card"><a href="/posts/{{id}}"><img class="card-thumbnail" src="{{thumbnail}}" alt="post thumbnail"/></a><div class="card-summary"><table><tbody><tr><td><a href="/posts/categories/{{category_id}}"><span class="card-category-name main-color">{{category_id}}</span></a><a href="/posts/{{id}}"><div class="card-title normal-color">{{title}}</div></a><div class="card-info normal-color">{{created_at}}</div></td></tr></tbody></table></div></div>',ready=function(){var e,t,a,o,s;e=document.getElementsByClassName("top-slider")[0],t=document.getElementsByClassName("root-header")[0],a=document.getElementById("body-container"),o=supportPageOffset?window.pageXOffset:isCSS1Compat?document.documentElement.scrollLeft:document.body.scrollLeft,s=supportPageOffset?window.pageYOffset:isCSS1Compat?document.documentElement.scrollTop:document.body.scrollTop,e&&t&&(s>=e.clientHeight?(a.style.top=t.clientHeight+16+"px",t.style.position="fixed"):(a.style.top="16px",t.style.position="relative")),window.onscroll=function(n){var r=(n||window.event,document.getElementsByClassName("pagination")[0]),l=document.querySelectorAll(".pagination .next a")[0];if(o=supportPageOffset?window.pageXOffset:isCSS1Compat?document.documentElement.scrollLeft:document.body.scrollLeft,s=supportPageOffset?window.pageYOffset:isCSS1Compat?document.documentElement.scrollTop:document.body.scrollTop,s&&e&&t&&(s>e.clientHeight?(a.style.top=t.clientHeight+16+"px",t.style.position="fixed"):(a.style.top="16px",t.style.position="relative")),l&&s+document.body.clientHeight>document.body.scrollHeight-50){var d,c,p,m,u,f,g,y;l.parentNode.setAttribute("class",""),d=l.getAttribute("href"),f={},g={},y={},d&&(c=new XMLHttpRequest,c.open("GET",d),c.onreadystatechange=function(){var e,t;if(e=4,t=200,4==c.readyState&&200==c.status){p=JSON.parse(c.responseText),m=p.pages,u=p.page,y=p.posts,f=p.categories;for(var o=0;o<f.length;o++){var s=f[o].id;g[s]=f[o].name}if(y){var n,l,d;for(n=[],postCounter=0;postCounter<y.length;postCounter++){for(var h=cardTemplate,v=y[postCounter],b="";h.match(/(?:\{{2})(\w{1,50})+(?:\}{2})/);)if(b=h.match(/(?:\{{2})(\w{1,50})+(?:\}{2})/)[1],"created_at"===b){var C=v[b],w="",A=["JAN","FAB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];w=""+A[(C.match(/(?:\d{4}-)(\d{2})(?:-\d{2})+/)[1]>>0)-1]+" "+C.match(/(?:\d{4}-\d{2}-)(\d{2})/)[1]+". "+C.match(/(\d{4})(?:-\d{2}-\d{2})/)[1],h=h.replace(/(?:\{{2})(\w{1,50})+(?:\}{2})/,w)}else h=h.replace(/(?:\{{2})(\w{1,50})+(?:\}{2})/,v[b]);for(;h.match(/(?:<span[^>]*>)(\d{1,4})+(?:\<\/span\>)/);)b=h.match(/(?:<span[^>]*>)(\d{1,4})+(?:\<\/span\>)/)[1],h=h.replace(/(?:<span[^>]*>)(\d{1,4})+(?:\<\/span\>)/,'<span class="card-category-name main-color"> '+g[b]+" </span>");n.push(h)}for(a.insertAdjacentHTML("beforeend",n.join("")),a.removeChild(r),l=document.createElement("ul"),l.setAttribute("class","list-layout pagination none"),d=[],i=u;i<m;i++){var E=document.createElement("li"),S=document.createElement("a");i===u?E.setAttribute("class","active"):i===u+1&&E.setAttribute("class","next"),S.setAttribute("href","/?page="+i),E.appendChild(S),l.appendChild(E)}a.insertAdjacentHTML("beforeend",l.outerHTML)}}},c.send())}},s||(a.style.top="16px",t.style.position="relative")};
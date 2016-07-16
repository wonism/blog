var cardTemplate = '' +
    '<article class="post-card">' +
    '<a class="post-image-link" href="/posts/{{id}}">' +
    '<img class="post-image" src="{{background_image}}" alt="post image">' +
    '</a>' +
    '<section class="post-information">' +
    '<i class="fa fa-tags"></i>' +
    '<a class="post-category-link" href="/posts/categories/{{category_id}}">' +
    '<span class="post-category-name">' +
    '{{category_id}}' +
    '</span>' +
    '</a>' +
    '&nbsp;&nbsp;' +
    '<i class="fa fa-calendar"></i>' +
    '<span class="post-registered">' +
    '{{created_at}}' +
    '</span>' +
    '<a class="post-link-title" href="/posts/{{id}}">' +
    '<h1 class="post-title">' +
    '{{title}}' +
    '</h1>' +
    '</a>' +
    '<p class="post-content">333</p>' +
    '<a class="" href="/posts/39">Go to Link →</a>' +
    '</section>' +
    '</article>';

var ready = function () {

  var bodyContainer, pagination, nextPage;
  var currentX, currentY;

  bodyContainer = jj('#body-container');

  currentX = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
  currentY = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

  addEvent(document.body, 'click', function (e) {
    if (e.target.className) {
      if (e.target.className.match(/^post\-link\-image$/)) {
        ga('send', 'event', '메인', 'Button Press', '포스트 클릭 - [' +
            e.target.parentNode.getElementsByClassName('post-category-name')[0].textContent.trim() + '] ' +
            e.target.parentNode.getElementsByClassName('post-title')[0].textContent.trim());
      } else if (e.target.className.match(/^post\-thumbnail$/)) {
        ga('send', 'event', '메인', 'Button Press', '포스트 클릭 - [' +
            e.target.parentNode.parentNode.getElementsByClassName('post-category-name')[0].textContent.trim() + '] ' +
            e.target.parentNode.parentNode.getElementsByClassName('post-title')[0].textContent.trim());
      } else if (e.target.className.match(/^post\-link\-title$/)) {
        ga('send', 'event', '메인', 'Button Press', '포스트 클릭 - [' +
            e.target.parentNode.getElementsByClassName('post-category-name')[0].textContent.trim() + '] ' +
            e.target.getElementsByClassName('post-title')[0].textContent.trim());
      } else if (e.target.className.match(/^post\-title$|^post\-title\s/)) {
        ga('send', 'event', '메인', 'Button Press', '포스트 클릭 - [' +
            e.target.parentNode.parentNode.getElementsByClassName('post-category-name')[0].textContent.trim() + '] ' +
            e.target.textContent.trim());
      } else if (e.target.className.match(/^post\-category\-link/)) {
        ga('send', 'event', '메인', 'Button Press', '포스트 카테고리 클릭 - ' +
            e.target.getElementsByClassName('post-category-name')[0].textContent.trim());
      } else if (e.target.className.match(/^post\-category\-name/)) {
        ga('send', 'event', '메인', 'Button Press', '포스트 카테고리 클릭 - ' +
            e.target.textContent.trim());
      }
    }
  });

  window.onscroll = function (event) {
    var e = event || window.event;
    var pagination = jj('.pagination')[0];
    var nextPage = jj('.pagination .next a')[0];

    currentX = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
    currentY = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

    if (nextPage) {
      if (currentY + document.body.clientHeight > document.body.scrollHeight - 50) {
        var nextUrl, xhr, result;
        var pages, page, categories, categoryIdName, posts;

        nextPage.parentNode.setAttribute('class', '');
        nextUrl = nextPage.getAttribute('href');

        categories = {};
        categoryIdName = {};
        posts = {};

        if (nextUrl) {
          xhr = new XMLHttpRequest();
          xhr.open("GET", nextUrl);
          xhr.onreadystatechange = function () {
            var DONE, OK;

            DONE = 4;
            OK = 200;

            if (xhr.readyState != 4 || xhr.status != 200) {
              return;
            }

            result = JSON.parse(xhr.responseText);

            pages = result.pages;
            page = result.page;

            posts = result.posts;
            categories = result.categories;

            var categoryCounter = 0;
            for (; categoryCounter < categories.length; categoryCounter++) {
              var idStr = categories[categoryCounter].id;
              categoryIdName[idStr] = categories[categoryCounter].name;
            }

            if (posts) {
              var templateArr;
              var ul, liArr, pageNumber;

              templateArr = [];

              postCounter = 0;
              for (; postCounter < posts.length; postCounter++) {
                var template = cardTemplate;
                var post = posts[postCounter];
                var key = '';

                while (template.match(/(?:\{{2})(\w{1,})+(?:\}{2})/)) {
                  key = template.match(/(?:\{{2})(\w{1,})+(?:\}{2})/)[1];
                  if (key === 'created_at') {
                    var date = post[key];
                    var dateStr = '';
                    var monthStrArr = ['JAN', 'FAB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                    dateStr = '' +
                        monthStrArr[(date.match(/(?:\d{4}-)(\d{2})(?:-\d{2})+/)[1] >> 0) - 1] + ' ' +
                        date.match(/(?:\d{4}-\d{2}-)(\d{2})/)[1] + '. ' +
                        date.match(/(\d{4})(?:-\d{2}-\d{2})/)[1];
                    template = template.replace(/(?:\{{2})(\w{1,})+(?:\}{2})/, dateStr);
                  } else {
                    template = template.replace(/(?:\{{2})(\w{1,})+(?:\}{2})/, post[key]);
                  }
                }

                while (template.match(/(?:<span[^>]*>)(\d{1,})+(?:\<\/span\>)/)) {
                  key = template.match(/(?:<span[^>]*>)(\d{1,})+(?:\<\/span\>)/)[1];
                  template = template.replace(/(?:<span[^>]*>)(\d{1,})+(?:\<\/span\>)/, '<span class="post-category-name"> ' + categoryIdName[key] + ' </span>');
                }
                templateArr.push(template);
              }

              bodyContainer.insertAdjacentHTML('beforeend', templateArr.join(''));
              bodyContainer.removeChild(pagination);

              ul = document.createElement('ul');
              ul.setAttribute('class', 'list-layout pagination none');

              liArr = [];

              i = page;
              for (; i < pages; i++) {
                var li = document.createElement('li');
                var a = document.createElement('a');
                if (i === page) {
                  li.setAttribute('class', 'active');
                } else if (i === page + 1) {
                  li.setAttribute('class', 'next');
                }
                a.setAttribute('href', '/?page=' + i);
                li.appendChild(a);
                ul.appendChild(li);
              }

              bodyContainer.insertAdjacentHTML('beforeend', ul.outerHTML);
            }
          };
          xhr.send();
        }
      }
    }
  };
};


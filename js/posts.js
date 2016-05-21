var commentTemplate = '' +
    '<div class="comment-infos">' +
    '<div class="comment-user">@@commenter@@</div>' +
    '<div class="comment-text">{{comment}}</div>' +
    '<div class="comment-date">{{created_at}}</div>' +
    '</div>';

var commentSerialize = function () {
  var data = '';

  data += 'post_id=' + document.getElementById('post-id').value;
  data += '&comment=' + document.getElementById('comment-area').value;
  data += '&parent_id=' + 0;

  submitComment(data);
};

var imageSerialize = function (element) {
  var data = element.files[0];
  var processingType = element.getAttribute('data-processing-type');

  submitImage(data, processingType);
};

var submitComment = function (data) {
  var xhr = new XMLHttpRequest();

  xhr.open('POST', document.getElementById('comment-area-wrapper').getAttribute('action'), true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.addEventListener('error', onError, false);
  xhr.addEventListener('progress', onProgress, false);
  xhr.onreadystatechange = function () {
    var DONE, OK;

    DONE = 4;
    OK = 200;

    if (xhr.readyState != 4 || xhr.status != 200) {
      return;
    }

    var result = JSON.parse(xhr.responseText);

    if (result && result.comment && result.commenter) {
      var template = commentTemplate;
      var comment = result.comment;
      var commenter = result.commenter;

      while (template.match(/(?:\{{2})(\w{1,50})+(?:\}{2})/)) {
        key = template.match(/(?:\{{2})(\w{1,50})+(?:\}{2})/)[1];
        if (key === 'created_at') {
          var date = comment[key];
          var dateStr = '';
          var monthStrArr = ['JAN', 'FAB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
          dateStr = '' +
              monthStrArr[(date.match(/(?:\d{4}-)(\d{2})(?:-\d{2})+/)[1] >> 0) - 1] + ' ' +
              date.match(/(?:\d{4}-\d{2}-)(\d{2})/)[1] + '. ' +
              date.match(/(\d{4})(?:-\d{2}-\d{2})/)[1];
          template = template.replace(/(?:\{{2})(\w{1,50})+(?:\}{2})/, dateStr);
        } else {
          template = template.replace(/(?:\{{2})(\w{1,50})+(?:\}{2})/, comment[key]);
        }
      }

      while (template.match(/(?:\@{2})(\w{1,50})+(?:\@{2})/)) {
        template = template.replace(/(?:\@{2})(\w{1,50})+(?:\@{2})/, commenter);
      }

      document.getElementById('comments-list').insertAdjacentHTML('afterbegin', template);
      document.getElementById('comments-count').innerHTML = (document.getElementById('comments-count').innerHTML >> 0) + 1;
    }
  };

  xhr.send(data);
};

var submitImage = function (data, processingType) {
  var xhr = new XMLHttpRequest();
  var fileType = data.name.match(/\.\w{1,5}/g)[data.name.match(/\.\w{1,5}/g).length - 1];

  xhr.open('POST', '/images/new?processing_type=' + processingType + '&file_type=' + fileType, true);
  xhr.setRequestHeader('Content-Type', 'application/octet-stream');
  xhr.addEventListener('error', onError, false);
  xhr.addEventListener('progress', onProgress, false);
  xhr.onreadystatechange = function () {
    var DONE, OK;

    DONE = 4;
    OK = 200;

    if (xhr.readyState != 4 || xhr.status != 200) {
      return;
    }

    var result = JSON.parse(xhr.responseText);

    if (result) {
      if (processingType >> 0 === 1) {
        document.getElementById('thumbnail').value = result.thumbnail;
      } else if (processingType >> 0 === 2) {
        document.getElementById('background_image').value = result.background;
      }
    }
  };

  xhr.send(data);
};

var onProgress = function (e) {
  // console.log(e);
  if (e.lengthComputable) {
    var percentComplete = (e.loaded / e.total) * 100;
  }
};

var onError = function (e) {
  // console.log(e);
};

var imageUpload = function (element) {
  var target, targetClone, targetParent;

  target = element;
  targetParent = target.parentNode;
  targetClone = document.createElement('input');

  targetClone.setAttribute('class', target.getAttribute('class'));
  targetClone.setAttribute('id', target.getAttribute('id'));
  targetClone.setAttribute('name', target.getAttribute('name'));
  targetClone.setAttribute('type', target.getAttribute('type'));

  if (target.files && target.files[0]) {
    var imageFile, imageType, imageName;
    var reader;

    imageFile = target.files[0];
    imageType = /image.*/;
    imageName = imageFile.name;
    reader = new FileReader();

    reader.onload = function (e) {
      var binaryData, image, w, h;
      image = document.createElement('img');
      image.src = e.target.result;
      w = image.width;
      h = image.height;

      if (w < 2) {
        alert('파일의 최소 가로 길이는 200px입니다.');
        targetParent.removeChild(target);
        targetParent.appendChild(targetClone);
      } else if (h < 2) {
        alert('파일의 최소 세로 길이는 200px입니다.');
        targetParent.removeChild(target);
        targetParent.appendChild(targetClone);
      } else {
        imageSerialize(target);
        document.querySelectorAll('img[data-targetted-image="' + target.getAttribute('id') + '"]')[0].src = e.target.result;
      }
    };

    reader.readAsDataURL(imageFile);
  }
};

var ready = function () {
  var postTags = jj('.tags a.tag'),
      posts = jj('.post a'),
      postImages = jj('.post a.pull-left'),
      postTexts = jj('.post-title-link'),
      postCategories = jj('.post-category-link');

  if (document.getElementById('comment-submit')) {
    addEvent(document.getElementById('comment-submit'), 'click', function () {
      commentSerialize();
    });
  }

  if (document.getElementsByClassName('image-upload').length) {
    var uploaders = document.getElementsByClassName('image-upload');

    var i = 0;
    for (; i < uploaders.length; i++) {
      addEvent(uploaders[i], 'change', function (e) {
        imageUpload(this);
      });
    }
  }

  if (document.getElementsByClassName('post-category-selector').length) {
    addEvent(document.getElementsByClassName('post-category-selector')[0], 'change', function (e) {
      ga('send', 'event', '포스트 리스트', 'Button Press', '카테고리 변경 - ' +
          this.options[this.selectedIndex].text);

      if (e.target.value >> 0 === 0) {
        window.location.href = '/posts';
      } else {
        window.location.href = '/posts/categories/' + e.target.value;
      }
    });
  }

  if (document.getElementById('post-search-submit')) {
    addEvent(document.getElementById('post-search-submit'), 'click', function (e) {
      document.getElementById('post-search-form').submit();
    });
  }

  var tagCounter = 0, tagLength = postTags.length;
  for (; tagCounter < tagLength; tagCounter++) {
    addEvent(postTags[tagCounter], 'click', function () {
      ga('send', 'event', '포스트 상세', 'Button Press', '포스트 태그 클릭' + ' - ' + this.textContent.trim());
    });
  }

  var postImageCounter = 0, postImageLength = postImages.length;
  for (; postImageCounter < postImageLength; postImageCounter++) {
    addEvent(postImages[postImageCounter], 'click', function () {
      ga('send', 'event', '포스트 리스트', 'Button Press', '포스트 클릭 - [' +
          this.parentNode.getElementsByClassName('post-category-name')[0].textContent.trim() + '] ' +
          this.parentNode.getElementsByClassName('post-title')[0].textContent.trim());
    });
  }

  var postTextCounter = 0, postTextLength = postTexts.length;
  for (; postTextCounter < postTextLength; postTextCounter++) {
    addEvent(postTexts[postTextCounter], 'click', function () {
      ga('send', 'event', '포스트 리스트', 'Button Press', '포스트 클릭 - [' +
          this.parentNode.getElementsByClassName('post-category-name')[0].textContent.trim() + '] ' +
          this.getElementsByTagName('div')[0].textContent.trim());
    });
  }

  var postCategoryCounter = 0, postCategoryLength = postCategories.length;
  for (; postCategoryCounter < postCategoryLength; postCategoryCounter++) {
    addEvent(postCategories[postCategoryCounter], 'click', function () {
      ga('send', 'event', '포스트 리스트', 'Button Press', '포스트 카테고리 클릭 - ' +
          this.getElementsByTagName('span')[0].textContent.trim());
    });
  }
};


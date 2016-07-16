var serializing = function (target) {
  var data = '';

  if (target.match(/check_id/)) {
    data += 'user_id=' + document.getElementById('user_id').value;
  } else if (target.match(/check_pw/)) {
    data += 'user_id=' + document.getElementById('user_id').value;
    data += '&password=' + document.getElementById('password').value;
  } else if (target.match(/check_em/)) {
    data += 'email=' + document.getElementById('email').value;
  }

  checkValidation(target, data);
};

var checkValidation = function (target, data) {
  var xhr = new XMLHttpRequest();

  xhr.open('POST', '/join/' + target, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function () {
    var DONE, OK;

    DONE = 4;
    OK = 200;

    if (xhr.readyState != 4 || xhr.status != 200) {
      return;
    }

    var result = JSON.parse(xhr.responseText);

    if (result.success) {
      if (result.checkTarget === 'id') {
        if (document.getElementById('id-validation-err')) {
          document.getElementById('id-validation-err').outerHTML = '';
        }
      } else if (result.checkTarget === 'password') {
        if (document.getElementById('pw-validation-err')) {
          document.getElementById('pw-validation-err').outerHTML = '';
        }
      } else if (result.checkTarget === 'email') {
        if (document.getElementById('em-validation-err')) {
          document.getElementById('em-validation-err').outerHTML = '';
        }
      }
    } else {
      var errMsg, errElement;
      if (result.checkTarget === 'id') {
        errMsg = '';

        switch (result.errType) {
          case 'idLength':
            errMsg = 'ID는 6~15 글자만 허용합니다.';
            break;
          case 'duplicateId':
            errMsg = '이미 사용중인 ID 입니다.';
            break;
          case 'idSpecial':
            errMsg = '특수 문자가 들어갈 수 없습니다.(_ 제외)';
            break;
        }

        if (document.getElementById('id-validation-err')) {
          document.getElementById('id-validation-err').innerHTML = errMsg;
          document.getElementById('user_id').focus();
        } else {
          errElement = document.createElement('span');
          errElement.setAttribute('id', 'id-validation-err');
          errElement.setAttribute('class', 'validation-err');
          errElement.innerHTML = errMsg;

          document.querySelectorAll('label[for="user_id"]')[0].insertAdjacentHTML('afterend', errElement.outerHTML);
          document.getElementById('user_id').focus();
        }
      } else if (result.checkTarget === 'password') {
        errMsg = '';

        switch (result.errType) {
          case 'pwLength':
            errMsg = '10 ~ 15자리를 사용해야 합니다.';
            break;
          case 'pwSpecial':
            errMsg = '특수문자를 1개 이상 사용해야 합니다.';
            break;
          case 'mix':
            errMsg = '숫자와 영문자를 혼용하여야 합니다.';
            break;
          case 'repetition':
            errMsg = '같은 문자를 4번 이상 사용하실 수 없습니다.';
            break;
          case 'includeId':
            errMsg = '아이디가 포함되었습니다.';
            break;
        }

        if (document.getElementById('pw-validation-err')) {
          document.getElementById('pw-validation-err').innerHTML = errMsg;
          document.getElementById('password').focus();
        } else {
          errElement = document.createElement('span');
          errElement.setAttribute('id', 'pw-validation-err');
          errElement.setAttribute('class', 'validation-err');
          errElement.innerHTML = errMsg;

          document.querySelectorAll('label[for="password"]')[0].insertAdjacentHTML('afterend', errElement.outerHTML);
          document.getElementById('password').focus();
        }
      } else if (result.checkTarget === 'email') {
        errMsg = '';

        switch (result.errType) {
          case 'invalidEmail':
            errMsg = '올바르지 않은 E-mail 형식입니다.';
            break;
          case 'duplicateEmail':
            errMsg = '이미 사용중인 E-mail 입니다.';
            break;
        }

        if (document.getElementById('em-validation-err')) {
          document.getElementById('em-validation-err').innerHTML = errMsg;
          document.getElementById('email').focus();
        } else {
          errElement = document.createElement('span');
          errElement.setAttribute('id', 'em-validation-err');
          errElement.setAttribute('class', 'validation-err');
          errElement.innerHTML = errMsg;

          document.querySelectorAll('label[for="email"]')[0].insertAdjacentHTML('afterend', errElement.outerHTML);
          document.getElementById('email').focus();
        }
      }
    }
  };

  xhr.send(data);
};

var ready = function () {
  addEvent(document.getElementById('join-submit'), 'click', function (e) {
    e.preventDefault();

    var id = document.getElementById('user_id').value;
    var nm = document.getElementById('name').value;
    var em = document.getElementById('email').value;
    var pw = document.getElementById('password').value;

    if (id === '') {
      alert('ID를 입력하지 않으셨습니다.');
      document.getElementById('user_id').focus();
      return false;
    }

    if (nm === '') {
      alert('비밀번호를 입력하지 않으셨습니다.');
      document.getElementById('password').focus();
      return false;
    }

    if (em === '') {
      alert('E-Mail을 입력하지 않으셨습니다.');
      document.getElementById('password').focus();
      return false;
    }

    if (pw === '') {
      alert('비밀번호를 입력하지 않으셨습니다.');
      document.getElementById('password').focus();
      return false;
    }

    if (!(id.length >= 6 && id.length <= 15)) {
      alert('ID는 6~15 글자만 허용합니다.');
      document.getElementById('user_id').focus();
      return false;
    }

    if (id.match(/[\s+=\-`~!@#$%^&*)(}{\]\[\'\"\:\;\.\,\>\<\?\/]/)) {
      alert('ID에는 특수 문자가 들어갈 수 없습니다.\n(_ 제외)');
      document.getElementById('user_id').focus();
      return false;
    }

    if (!em.match(/(\w)+\@(\w)+\.(\w)+/)) {
      alert('올바르지 않은 E-mail 형식입니다.');
      document.getElementById('email').focus();
      return false;
    }

    if (!pw.match(/[\s+=_\-`~!@#$%^&*)(}{\]\[\'\"\:\;\.\,\>\<\?\/]/)) {
      alert('비밀번호는 키보드 상의 특수문자를 최소 1개 이상 사용해야 합니다.');
      document.getElementById('password').focus();
      return false;
    }

    if (!pw.match(/^(?=.*[a-zA-Z])(?=.*[\s+=_-`~!@#$%^&*)(}{\]\[\'\"\:\;\.\,\>\<\?\])(?=.*[0-9]).{8,16}$/)) {
      alert('비밀번호는 10 ~ 15자리를 사용해야 합니다.');
      document.getElementById('password').focus();
      return false;
    }

    if (pw.search(/[0-9]/g) < 0 || pw.search(/[a-z]/ig) < 0) {
      alert('비밀번호는 숫자와 영문자를 혼용하여야 합니다.');
      document.getElementById('password').focus();
      return false;
    }

    if (/(\w)\1\1\1/.test(pw)) {
      alert('비밀번호는 같은 문자를 4번 이상 사용하실 수 없습니다.');
      document.getElementById('password').focus();
      return false;
    }

    if (typeof id === 'string' && pw.search(id) > -1) {
      alert('비밀번호에 아이디가 포함되었습니다.');
      document.getElementById('password').focus();
      return false;
    }

    document.getElementById('join-form').submit();
  });

  addEvent(document.getElementById('user_id'), 'blur', function (e) {
    serializing('check_id');
  });

  addEvent(document.getElementById('email'), 'blur', function (e) {
    serializing('check_em');
  });

  addEvent(document.getElementById('password'), 'blur', function (e) {
    serializing('check_pw');
  });
};


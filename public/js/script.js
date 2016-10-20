var lock = new Auth0Lock('KBoDe6JHtErBVYwfDyubAIku3OlJvMe9', 'nathanjensby.auth0.com', {
   auth: {
     params: {
       scope: 'openid email'
     }
   }
 });

 lock.on("authenticated", function(authResult) {
  lock.getProfile(authResult.idToken, function(error, profile) {
    console.log(profile);
    if (error) {
      // Handle error
      return;
    }

    localStorage.setItem('id_token', authResult.idToken);
    $('#btn-login').hide();
    loadStudents();
    $('#btn-logout').show();
})
})

$(document).ready(function() {
  localStorage.removeItem('id_token');
    $('#btn-login').on('click', function (e) {
      e.preventDefault();
      lock.show();
    })
    $('#btn-logout').on('click', function (e) {
      e.preventDefault();
      logOut();
    })

    $('#add-student').on('submit', addNewStudent)

    if (isLoggedIn()) {
      loadStudents();
    }

})

function isLoggedIn() {
    if (localStorage.getItem('id_token')) {
      return isJwtValid();
    } else {
      return false;
    }
}

function logOut() {
  localStorage.removeItem('id_token');
  window.location.href = "/";
}

function loadStudents() {
  $("#add-student").show();
  $.ajax({
    url: "http://localhost:3000/students",
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('id_token')
    }
  }).done(function (data) {
      data.forEach(function (obj) {
      loadStudent(obj);
    })

  })
}

function loadStudent(student) {
    var li = $('<li />')
    li.data('id', student._id);
    li.text(student.firstName + ' '+student.lastName);
    $('#studentList').append(li)
}

function addNewStudent(e) {
  e.preventDefault();
  $.ajax({
    url: "http://localhost:3000/students",
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('id_token')
    },
    method: "POST",
    data: {
      firstName: $('#student-first-name').val(),
      lastName: $('#student-last-name').val()
    }
  }).done(function () {
    $("#studentList").empty();
    $('#student-first-name').val("");
    $('#student-last-name').val("");
    loadStudents();
  })
}

function isJwtValid() {
  var token = localStorage.getItem('id_token')
  if (!token) {
    return false;
  }
  var encodedPayload = token.split('.')[1]
  var decodedPayload = JSON.parse(atob(encodedPayload))
  var exp = decodedPayload.exp;
  var expirationDate = new Date(exp * 1000);
  return new Date() <= expirationDate;
}

/**
 * Created by Peter Sbarski
 * Serverless Architectures on AWS
 * http://book.acloud.guru/
 * Last Updated: Feb 11, 2017
 */


var userController = {
  data: {
    auth0Lock: null,
    config: null
  },
  uiElements: {
    loginButton: null,
    logoutButton: null,
    profileButton: null,
    profileNameLabel: null,
    profileImage: null
  },
  init: function(config) {
    var that = this;

    this.uiElements.loginButton = $('#auth0-login');
    this.uiElements.logoutButton = $('#auth0-logout');
    this.uiElements.profileButton = $('#user-profile');
    this.uiElements.profileNameLabel = $('#profilename');
    this.uiElements.profileImage = $('#profilepicture');

    this.data.config = config;
    this.data.auth0Lock = new Auth0Lock(config.auth0.clientId, config.auth0.domain);

    this.data.auth0Lock.on("authenticated", function(authResult) {
      
      console.log("authResult: " + JSON.stringify(authResult));

      // Call getUserInfo using the token from authResult
  
       this.getUserInfo(authResult.accessToken, function(error, profile) {
        if (error) {
          // Error callback
          alert('There was an error getting user info');
        } else {
          // Save the JWT token.
          console.log('saving user token');

          localStorage.setItem('accessToken', authResult.accessToken);
          localStorage.setItem('idToken', authResult.idToken);
          that.configureAuthenticatedRequests();
          that.showUserAuthenticationDetails(profile);
        }
      });
    });

    var accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      this.configureAuthenticatedRequests();
      this.data.auth0Lock.getUserInfo(accessToken, function(err, profile) {
        if (err) {
          return alert('There was an error getting the profile: ' + err.message);
        }
        that.showUserAuthenticationDetails(profile);
      });
    }

    this.wireEvents();
  },
  configureAuthenticatedRequests: function() {
    $.ajaxSetup({
      'beforeSend': function(xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('idToken'));
        xhr.setRequestHeader('AccessToken', localStorage.getItem('accessToken'));
      }
    });
  },
  showUserAuthenticationDetails: function(profile) {
    var showAuthenticationElements = !!profile;

    if (showAuthenticationElements) {
      this.uiElements.profileNameLabel.text(profile.nickname);
      this.uiElements.profileImage.attr('src', profile.picture);
    }

    this.uiElements.loginButton.toggle(!showAuthenticationElements);
    this.uiElements.logoutButton.toggle(showAuthenticationElements);
    this.uiElements.profileButton.toggle(showAuthenticationElements);
  },
  wireEvents: function() {
    var that = this;

    this.uiElements.loginButton.click(function(e) {
      var params = {
        authParams: {
          scope: 'openid email user_metadata picture'
        }
      };

      that.data.auth0Lock.show(params);
    });

    this.uiElements.logoutButton.click(function(e) {
      localStorage.removeItem('accessToken');

      that.uiElements.logoutButton.hide();
      that.uiElements.profileButton.hide();
      that.uiElements.loginButton.show();
    });

    this.uiElements.profileButton.click(function(e) {
      var url = that.data.config.apiBaseUrl + '/user-profile';

      $.get(url, function(data, status) {

        alert(JSON.stringify(data));

        $('#user-profile-raw-json').text(JSON.stringify(data, null, 2));
        $('#user-profile-modal').modal();
      })
    });
  }
}
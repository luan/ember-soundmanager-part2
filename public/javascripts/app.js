App = Ember.Application.create();

App.Store = DS.Store.extend({
  adapter: 'DS.FixtureAdapter'
});

App.Router.map(function () {
  this.resource('songs');
  this.resource('song', { path: '/song/:song_id' });
});

// App.IndexRoute = Ember.Route.extend({
//   redirect: function() { this.transitionTo('songs'); }
// });

App.SongsRoute = Ember.Route.extend({
  model: function() {
    return App.Song.find();
  }
});

App.SongRoute = Ember.Route.extend({
  model: function(params) {
    return App.Song.find(params.song_id);
  }
});

App.Song = DS.Model.extend({
  url: DS.attr('string')
});

App.SoundPlayerView = Ember.SoundPlayerView.extend({
  templateName: 'soundplayer',

  playPauseLink: function() {
    if (this.get('isPlaying')) {
      return 'Pause';
    } else {
      return 'Play';
    }
  }.property('isPlaying'),
});

App.initializer({
  name: "soundmanager",
  initialize: function() {
    soundManager.setup({
      url: '/swf'
    });
  }
});

Ember.Handlebars.helper('soundPlayer', App.SoundPlayerView);

App.Song.FIXTURES = [
  {
    id: 1,
    url: '/mp3/going_outside.mp3'
  }
]

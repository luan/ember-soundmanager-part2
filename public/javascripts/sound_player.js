Ember.SoundPlayerManager = Ember.StateManager.extend({
  initialState: 'preparing',

  preparing: Ember.State.create({
    ready: function(manager, context) {
      manager.transitionTo('unloaded');
    }
  }),

  unloaded: Ember.State.create({
    loaded: function(manager, context) {
      manager.transitionTo('stopped');
    }
  }),

  stopped: Ember.State.create({
    play: function(manager, context) {
      manager.transitionTo('started.playing');
    }
  }),

  started: Ember.State.create({
    stop: function(manager, context) {
      manager.transitionTo('stopped');
    },

    paused: Ember.State.create({
      play: function(manager, context) {
        manager.transitionTo('playing');
      }
    }),

    playing: Ember.State.create({
      pause: function(manager, context) {
        manager.transitionTo('paused')
      }
    })
  })
});

Ember.SoundPlayerView = Ember.View.extend({
  init: function() {
    var manager = Ember.SoundPlayerManager.create();
    var self = this;

    this.set("stateManager", manager);
    soundManager.onready(function() {
      manager.send('ready');
      self.loadSound();
    });
    this._super();
  },

  urlChanged: function() {
    this.soundObject.destruct();
    this.soundObject = undefined;
    this.get('stateManager').transitionTo('unloaded');
    this.loadSound();
  }.observes('url'),

  soundLoaded: function() {
    this.get('stateManager').send('loaded');
    this.set('position', 0);
    this.set('duration', this.get('sound').duration);
  },

  loadSound: function() {
    var self = this;

    if (!this.get('isStopped')) {
      this.stop();
    }

    if (!this.soundObject) {
      this.soundObject = soundManager.createSound({
        url: this.get('url'),
        onload: function() { self.soundLoaded(); },
        whileplaying: function() { self.tick(); },
        onfinish: function() { self.finish(); }
      });

      this.soundObject.load();
    }
  },

  sound: function() {
    this.loadSound();
    return this.soundObject;
  }.property('url'),

  play: function() {
    if (this.get('isStopped')) {
      this.get('sound').play();
    } else {
      this.get('sound').resume();
    }
    this.get('stateManager').send('play');
  },

  pause: function() {
    this.get('stateManager').send('pause');
    this.get('sound').pause();
  },

  toggle: function() {
    if (this.get('isPlaying')) {
      this.pause();
    } else {
      this.play();
    }
  },

  stop: function() {
    this.get('stateManager').send('stop');
    this.get('sound').stop();
    this.set('position', 0);
  },

  finish: function() {
    this.get('stateManager').send('stop');
    this.set('position', 0);
  },

  tick: function() {
    this.set('position', this.get('sound').position);
  },

  isLoading: function() {
    return this.get('stateManager.currentState.name') === 'unloaded';
  }.property('stateManager.currentState'),

  isStopped: function() {
    return !/^started\./.test(this.get('stateManager.currentState.path'));
  }.property('stateManager.currentState'),

  isPlaying: function() {
    return this.get('stateManager.currentState.name') === 'playing'
  }.property('stateManager.currentState')
});

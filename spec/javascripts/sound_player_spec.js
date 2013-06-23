describe('Ember.SoundPlayerView', function() {
  var player;

  beforeEach(function() {
    player = Ember.SoundPlayerView.create({ url: '/__spec__/fixtures/song.mp3' });
    waitForReady();
  });

  afterEach(function() {
    player.get('sound').stop();
    player.get('sound').destruct();
  });

  describe('with a sound url', function() {
    describe('sound is loaded', function() {
      it('is stopped', function() {
        expect(player.get('isStopped')).toBe(true);
      });

      it('plays', function() {
        var sound = player.get('sound');

        spyOn(sound, 'play');
        player.play();
        expect(sound.play).toHaveBeenCalled();
        expect(player.get('isPlaying')).toBe(true);
      });

      it('toggles playback', function() {
        var sound = player.get('sound');

        spyOn(sound, 'play');
        spyOn(sound, 'pause');
        player.toggle();
        expect(sound.play).toHaveBeenCalled();
        expect(player.get('isPlaying')).toBe(true);

        player.toggle();
        expect(sound.pause).toHaveBeenCalled();
        expect(player.get('isPlaying')).toBe(false);

        player.toggle();
        expect(sound.play).toHaveBeenCalled();
        expect(player.get('isPlaying')).toBe(true);
      });

      describe('when it is playing', function() {
        beforeEach(function() {
          player.play();
          expect(player.get('isPlaying')).toBe(true);
        });

        it('tracks the progress', function() {
          waitForPlaying();

          waits(50);
          runs(function() {
            expect(player.get('position')).toBeGreaterThan(0);
          });
        });

        it('knows the total duration', function() {
          expect(player.get('position')).toBe(0);
          expect(player.get('duration')).toBe(731);
        });

        it('pauses', function() {
          var sound = player.get('sound');

          spyOn(sound, 'pause');
          player.pause();
          expect(sound.pause).toHaveBeenCalled();
          expect(player.get('isPlaying')).toBe(false);
        });

        it('finishes', function() {
          waitForPlaying();
          waits(player.get('duration') + 50);

          runs(function() {
            expect(player.get('isStopped')).toBe(true);
            expect(player.get('position')).toBe(0);
          });
        });

        describe('when it is paused', function() {
          beforeEach(function() {
            player.pause();
          });

          it('resumes', function() {
            var sound = player.get('sound');

            spyOn(sound, 'resume');
            player.play();
            expect(sound.resume).toHaveBeenCalled();
            expect(player.get('isPlaying')).toBe(true);
          });
        });

        it('stops', function() {
          var sound = player.get('sound');

          spyOn(sound, 'stop');
          player.set('position', 1);
          player.stop();
          expect(sound.stop).toHaveBeenCalled();
          expect(player.get('isStopped')).toBe(true);
          expect(player.get('position')).toBe(0);
        });
      });
    });

    describe('changing the sound', function() {
      var oldSound;

      beforeEach(function() {
        oldSound = player.get('sound');
        spyOn(oldSound, 'destruct').andCallThrough();
        player.play();
        player.set('url', '/__spec__/fixtures/song2.mp3');
      });

      it('reloads the sound', function() {
        expect(player.get('sound').url).toBe('/__spec__/fixtures/song2.mp3');
      });

      it('unloads the old sound', function() {
        expect(oldSound.destruct).toHaveBeenCalled();
        expect(player.get('isStopped')).toBe(true);
        expect(player.get('isLoading')).toBe(true);
      });
    });
  });

  function waitForReady() {
    waits(10);

    runs(function() {
      if (player.get('stateManager.currentState.name') !== 'stopped') {
        waitForReady();
      }
    });
  }

  function waitForPlaying() {
    waits(10);

    runs(function() {
      if (!player.get('sound').position) {
        waitForPlaying();
      }
    });
  }
});

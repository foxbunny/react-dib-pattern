import React, { Component } from 'react'
import * as ReactDOM from 'react-dom/client'

let
  STOPPED = 0,
  PAUSED = 1,
  PLAYING = 2,
  FAST_FORWARDING = 3,
  STATE_TRANSITIONS = { // valid state changes CURRENT -> NEXT -> OUTCOME
    [STOPPED]: {
      [PLAYING]: PLAYING,
    },
    [PAUSED]: {
      [STOPPED]: STOPPED,
      [PLAYING]: PLAYING,
    },
    [PLAYING]: {
      [STOPPED]: STOPPED,
      [PLAYING]: PAUSED,
      [FAST_FORWARDING]: FAST_FORWARDING,
    },
    [FAST_FORWARDING]: {
      [PLAYING]: PLAYING,
    },
  },
  initState = () => ({ mode: STOPPED, position: 0, duration: 0 }),
  setDuration = duration => state => ({ ...state, duration }),
  setPosition = position => state => ({ ...state, position }),
  setPlaybackMode = mode => state => ({ ...state, mode: STATE_TRANSITIONS[state.mode][mode] ?? STOPPED })

let
  Icon = ({ label, iconId }) => (
    <svg aria-label={label} viewBox="0 0 32 32">
      <use href={`icons.svg#${iconId}`}></use>
    </svg>
  ),
  App = class extends Component {
    constructor(props) {
      super(props)
      this.state = initState()
    }

    onReady = ev => this.setState(setDuration(ev.target.duration))
    onUpdatePosition = ev => this.setState(setPosition(ev.target.currentTime))
    onEnded = ev => this.setState(setPlaybackMode(STOPPED))
    onPlayPause = () => this.setState(setPlaybackMode(PLAYING))
    onFastForward = () => this.state.mode && this.setState(setPlaybackMode(FAST_FORWARDING))
    onStop = () => this.setState(setPlaybackMode(STOPPED))

    render() {
      return (
        <section hidden={!this.state.duration}>
          <react-audio playback-state={this.state.mode}>
            <audio
              onTimeUpdate={this.onUpdatePosition}
              onEnded={this.onEnded}
              onLoadedData={this.onReady}
              src="drunk.mp3"></audio>
          </react-audio>

          <article id="player">
            <div
              id="progress"
              role="progressbar"
              aria-valuemax={this.state.duration}
              aria-valuenow={this.state.position}
              style={{ '--position': `${this.state.position / this.state.duration * 100}%` }}></div>

            <div id="controls">
              <fieldset>
                <button onClick={this.onPlayPause} aria-pressed={this.state.mode !== STOPPED}>
                  <Icon label="play and pause" iconId="play-pause" />
                </button>
                <button onPointerDown={this.onFastForward}
                        onPointerUp={this.onPlayPause}
                        disabled={this.state.mode !== PLAYING}>
                  <Icon label="fast forward" iconId="fast-forward" />
                </button>
                <button onClick={this.onStop}>
                  <Icon label="stop" iconId="stop" />
                </button>
              </fieldset>
              <span role="status" aria-live="polite">
                <span id="pause-indicator"
                      data-active={this.state.mode === PAUSED}>
                  {this.state.mode === PAUSED ? 'paused' : 'not paused'}
                </span>
                pause
              </span>
            </div>
          </article>
        </section>
      )
    }
  }

customElements.define('react-audio', class extends HTMLElement {
  static get observedAttributes() { return ['playback-state'] }

  attributeChangedCallback(name) {
    switch (name) {
      case 'playback-state':
        this.updatePlaybackState()
        break
    }
  }

  updatePlaybackState() {
    switch (Number(this.getAttribute('playback-state')) || STOPPED) {
      case STOPPED: // stop
        this.firstElementChild.pause()
        this.firstElementChild.currentTime = 0
        break
      case PLAYING: // play
        this.firstElementChild.playbackRate = 1
        this.firstElementChild.play()
        break
      case PAUSED:
        this.firstElementChild.pause()
        break
      case FAST_FORWARDING:
        this.firstElementChild.playbackRate = 3
        break
    }
  }
})

ReactDOM.createRoot(document.getElementById('app')).render(<App />)

import React, { useState } from 'react'
import * as ReactDOM from 'react-dom/client'

let
  STOPPED = 0,
  PAUSED = 1,
  PLAYING = 2,
  FAST_FORWARDING = 3,
  REWINDING = 4,
  STATE_TRANSITIONS = { // valid state changes CURRENT -> NEXT -> OUTCOME
    [STOPPED]: {
      [STOPPED]: STOPPED,
      [PLAYING]: PLAYING,
      [FAST_FORWARDING]: STOPPED,
      [REWINDING]: STOPPED,
    },
    [PAUSED]: {
      [STOPPED]: STOPPED,
      [PLAYING]: PLAYING,
      [FAST_FORWARDING]: PAUSED,
      [REWINDING]: PAUSED,
    },
    [PLAYING]: {
      [STOPPED]: STOPPED,
      [PLAYING]: PAUSED,
      [FAST_FORWARDING]: FAST_FORWARDING,
      [REWINDING]: REWINDING,
    },
    [FAST_FORWARDING]: {
      [STOPPED]: STOPPED,
      [PLAYING]: PAUSED,
      [FAST_FORWARDING]: FAST_FORWARDING,
      [REWINDING]: REWINDING,
    },
    [REWINDING]: {
      [STOPPED]: STOPPED,
      [PLAYING]: PAUSED,
      [FAST_FORWARDING]: FAST_FORWARDING,
      [REWINDING]: REWINDING,
    },
  },
  initState = () => ({ mode: STOPPED, position: 0 }),
  setPosition = (state, position) => ({ ...state, position }),
  setPlaybackMode = (state, mode) => ({ ...state, mode: STATE_TRANSITIONS[state.mode][mode] })

let
  App = () => {
    let [state, setState] = useState(initState())

    let
      onUpdatePosition = ev =>
        setState(state => setPosition(state, ev.target.position)),
      onPlayPause = () =>
        setState(state => setPlaybackMode(state, PLAYING)),
      onStop = () =>
        setState(state => setPlaybackMode(state, STOPPED)),
      onFastForward = () => {
        if (state.mode) setState(state => setPlaybackMode(state, FAST_FORWARDING))
      },
      onRewind = () => {
        if (state.mode) setState(state => setPlaybackMode(state, REWINDING))
      }

    return (
      <article>
        <react-audio playback-state={state.mode} onChange={onUpdatePosition}>
          <audio src="drunk.mp3"></audio>
        </react-audio>

        <fieldset>
          <button onClick={onRewind}>Rewind</button>
          <button onClick={onPlayPause}>Play/pause</button>
          <button onClick={onFastForward}>Fast forward</button>
          <button onClick={onStop}>Stop</button>
        </fieldset>
      </article>
    )
  }

customElements.define('react-audio', class extends HTMLElement {
  constructor() {
    super()

    Object.defineProperty(this, 'position', {
      get() { return this.firstElementChild?.currentTime ?? 0 },
    })
    Object.defineProperty(this, 'playbackState', {
      get() { return Number(this.getAttribute('playback-state')) || STOPPED },
      set(x) { this.setAttribute('playback-state', x) },
    })
  }

  static get observedAttributes() { return ['playback-state'] }

  attributeChangedCallback(name) {
    switch (name) {
      case 'playback-state':
        this.updatePlaybackState()
        break
    }
  }

  updatePlaybackState() {
    if (!this.firstElementChild) return
    switch (this.playbackState) {
      case STOPPED: // stop
        this.firstElementChild.pause()
        this.firstElementChild.currentTime = 0
        this.dispatchEvent(new Event('change'))
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
      case REWINDING:
        this.firstElementChild.playbackRate = -3
        break
    }
  }
})

ReactDOM.createRoot(document.getElementById('app')).render(<App />)

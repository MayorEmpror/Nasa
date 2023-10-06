import {EnginePropertyNotFoundException} from "./Exceptions"
class StateMachine {
    begin(name="StateMachine") {
        this._states = {}
        this._name = name
    }

    declare(state, on_update) {
        this._states[state] = {value: null, _upda: on_update, events: {}}
    }
    
    on(state, on_update) {
        this._states[state]._upda = on_update
    }

    addEventListener(state, event, trigger) {
        this._states[state].events[event] = trigger
    }

    triggerStateEvent(state, event) {
        if (event in this._states[state].events) {
            this._states[state].events[event](this._states[state].value)
        }
    }

    update(state, value) {
        if (this._states[state]) {
            this._states[state].value = value
            this._states[state]._upda(value)
        }
        else {
            throw new EnginePropertyNotFoundException(`Tried to access undefined property "${state}" at StateMachine@${this._name} `)
        }
    }

    remove(state) {
        if (!this.hasState(state)) {
            this.triggerStateEvent(state, "remove")
            delete this._states[state]
        }
        return 0
    }

    hasState(state) {
        return state in this._states
    }
    
    findState(state) {
        this.triggerStateEvent(state, "located")
        if (!this.hasState(state)) return null
        return this._states[state]
    }
}

export default StateMachine
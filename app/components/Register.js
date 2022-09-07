import React, {useEffect, useContext} from "react"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {useImmerReducer} from "use-immer"
import {CSSTransition} from "react-transition-group"

//Components
import Loading from "./Loading"
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"

function Register() {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const initialState = {
    username: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: true,
      checkCount: 0
    },
    email: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: true,
      checkCount: 0
    },
    password: {
      value: "",
      hasErrors: false,
      message: ""
    },
    submitCount: 0,
    submitting: false
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "usernameImmediately":
        draft.username.hasErrors = false
        draft.username.value = action.value
        if (draft.username.value.length > 32) {
          draft.username.hasErrors = true
          draft.username.message = "Username cannot exceed 32 characters."
        }
        if (draft.username.value && !/^([a-zA-Z0-9]+)$/.test(draft.username.value)) {
          draft.username.hasErrors = true
          draft.username.message = "Username can only contain letters and numbers."
        }
        return
      case "usernameAfterDelay":
        if (draft.username.value.length < 2) {
          draft.username.hasErrors = true
          draft.username.message = "Username must be at least 2 characters."
        }
        if (!draft.username.hasErrors && !action.noRequest) {
          draft.username.checkCount++
        }
        return
      case "usernameUniqueResults":
        if (action.value) {
          draft.username.hasErrors = true
          draft.username.isUnique = false
          draft.username.message = "That username is already taken."
        } else {
          draft.username.isUnique = true
        }
        return
      case "emailImmediately":
        draft.email.hasErrors = false
        draft.email.value = action.value
        return
      case "emailAfterDelay":
        if (!/^\S+@\S+$/.test(draft.email.value)) {
          draft.email.hasErrors = true
          draft.email.message = "You must provide a valid email address."
        }
        if (!draft.email.hasErrors && !action.noRequest) {
          draft.email.checkCount++
        }
        return
      case "emailUniqueResults":
        if (action.value) {
          draft.email.hasErrors = true
          draft.email.isUnique = false
          draft.email.message = "That email is already being used."
        } else {
          draft.email.isUnique = true
        }
        return
      case "passwordImmediately":
        draft.password.hasErrors = false
        draft.password.value = action.value
        if (draft.password.value.length > 32) {
          draft.password.hasErrors = true
          draft.password.message = "Password cannot exceed 32 characters."
        }
        return
      case "passwordAfterDelay":
        if (draft.password.value.length < 8) {
          draft.password.hasErrors = true
          draft.password.message = "Password must be at least 8 characters."
        }
        return
      case "submitForm":
        if (!draft.username.hasErrors && draft.username.isUnique && !draft.email.hasErrors && draft.email.isUnique && !draft.password.hasErrors) {
          draft.submitCount++
        }
        return
      case "startSubmitting":
        draft.submitting = true
        return
      case "finishSubmitting":
        draft.submitting = false
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(() => dispatch({type: "usernameAfterDelay"}), 500)
      return () => clearTimeout(delay)
    }
  }, [state.username.value])

  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(() => dispatch({type: "emailAfterDelay"}), 500)
      return () => clearTimeout(delay)
    }
  }, [state.email.value])

  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(() => dispatch({type: "passwordAfterDelay"}), 500)
      return () => clearTimeout(delay)
    }
  }, [state.password.value])

  //Check username
  useEffect(() => {
    if (state.username.checkCount) {
      async function fetchResults() {
        cancelPreviousRequest()
        try {
          const response = await Axios.post("/doesUsernameExist", {username: state.username.value}, {cancelToken: newCancelToken()})

          dispatch({type: "usernameUniqueResults", value: response.data})
        } catch (e) {
          console.log(e)
        }
      }
      fetchResults()
    }
  }, [state.username.checkCount])

  //Check email
  useEffect(() => {
    if (state.email.checkCount) {
      async function fetchResults() {
        cancelPreviousRequest()
        try {
          const response = await Axios.post("/doesEmailExist", {email: state.email.value}, {cancelToken: newCancelToken()})

          dispatch({type: "emailUniqueResults", value: response.data})
        } catch (e) {
          console.log(e)
        }
      }
      fetchResults()
    }
  }, [state.email.checkCount])

  //Submit form
  useEffect(() => {
    if (state.submitCount) {
      dispatch({type: "startSubmitting"})
      async function fetchResults() {
        cancelPreviousRequest()
        try {
          const response = await Axios.post("/register", {username: state.username.value, email: state.email.value, password: state.password.value}, {cancelToken: newCancelToken()})

          if (response.data.success) {
            appDispatch({type: "login", data: response.data})
            appDispatch({type: "flashMessage", value: response.data.message})
            dispatch({type: "finishSubmitting"})
          } else {
            throw new Error(response.data.message)
          }
        } catch (e) {
          if (isCancel(e)) {
            console.log(e)
            return
          }
          console.log(e)
          appDispatch({type: "flashMessage", value: e.message, warning: true})
          dispatch({type: "finishSubmitting"})
        }
      }
      fetchResults()
    }
  }, [state.submitCount])

  function handleSubmit(e) {
    e.preventDefault()
    dispatch({type: "usernameImmediately", value: state.username.value})
    dispatch({type: "usernameAfterDelay", value: state.username.value, noRequest: true})
    dispatch({type: "emailImmediately", value: state.email.value})
    dispatch({type: "emailAfterDelay", value: state.email.value, noRequest: true})
    dispatch({type: "passwordImmediately", value: state.password.value})
    dispatch({type: "passwordAfterDelay", value: state.password.value})
    dispatch({type: "submitForm"})
  }

  return (
    <form onSubmit={handleSubmit} className="form register">
      <div className="form__group">
        <label className="form__label" htmlFor="register-username">
          Username
        </label>

        <input
          onChange={e => {
            dispatch({type: "usernameImmediately", value: e.target.value})
          }}
          className="form__input"
          type="text"
          name="username"
          id="register-username"
        />
        <CSSTransition in={state.username.hasErrors || !state.username.isUnique} timeout={250} classNames="live-validate-message" unmountOnExit>
          <div className="live-validate-message">{state.username.message}</div>
        </CSSTransition>
      </div>

      <div className="form__group">
        <label className="form__label" htmlFor="register-email">
          Email
        </label>

        <input
          onChange={e => {
            dispatch({type: "emailImmediately", value: e.target.value})
          }}
          className="form__input"
          type="text"
          name="email"
          id="register-email"
        />
        <CSSTransition in={state.email.hasErrors || !state.email.isUnique} timeout={250} classNames="live-validate-message" unmountOnExit>
          <div className="live-validate-message">{state.email.message}</div>
        </CSSTransition>
      </div>

      <div className="form__group">
        <label className="form__label" htmlFor="register-password">
          Password
        </label>

        <input
          onChange={e => {
            dispatch({type: "passwordImmediately", value: e.target.value})
          }}
          className="form__input"
          type="password"
          name="password"
          id="register-password"
        />
        <CSSTransition in={state.password.hasErrors} timeout={250} classNames="live-validate-message" unmountOnExit>
          <div className="live-validate-message">{state.password.message}</div>
        </CSSTransition>
      </div>

      <div className="form__group">
        <button className="form__submit button" type="submit" disabled={state.submitting}>
          {state.submitting ? <Loading fontSize={16} /> : `Sign up for ${appState.siteName}`}
        </button>
      </div>
    </form>
  )
}

export default Register

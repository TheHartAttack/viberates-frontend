import React, {useEffect, useContext, useRef} from "react"
import {Link} from "react-router-dom"
import Axios from "axios"
import {useImmer} from "use-immer"
import useCancelToken from "react-use-cancel-token"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faSignInAlt} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"

//Components
import FormInput from "./form/FormInput"
import FormSubmit from "./form/FormSubmit"

function HeaderLoggedOut(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const input = useRef(null)
  const [state, setState] = useImmer({
    loginOpen: false,
    focused: false,
    mouseOver: false,
    clicked: false,
    username: "",
    password: "",
    submitting: false,
    submitCount: 0
  })

  useEffect(() => {
    if (state.mouseOver || state.focused || state.clicked) {
      setState(draft => {
        draft.loginOpen = true
      })
    } else {
      setState(draft => {
        draft.loginOpen = false
      })
    }
  }, [state.mouseOver, state.focused, state.clicked])

  useEffect(() => {
    if (state.submitCount) {
      async function login() {
        cancelPreviousRequest()
        setState(draft => {
          draft.submitting = true
        })

        try {
          const response = await Axios.post("/login", {username: state.username, password: state.password}, {cancelToken: newCancelToken()})

          if (response.data.success) {
            appDispatch({type: "login", data: response.data.user})
            appDispatch({type: "flashMessage", value: response.data.message})
          } else {
            throw new Error(response.data.message)
          }
        } catch (e) {
          if (isCancel(e)) {
            console.log(e)
            return
          }
          setState(draft => {
            draft.submitting = false
          })
          appDispatch({type: "flashMessage", value: e.message, warning: true})
          console.log(e)
        }
      }
      login()
    }
  }, [state.submitCount])

  function handleSubmit(e) {
    e.preventDefault()
    setState(draft => {
      draft.submitCount++
    })
  }

  return (
    <div
      className={`header__button login${state.loginOpen ? " login--active" : ""} `}
      onMouseEnter={e =>
        setState(draft => {
          draft.mouseOver = true
        })
      }
      onMouseLeave={e => {
        setState(draft => {
          draft.mouseOver = false
          draft.clicked = false
        })
      }}
    >
      <div
        className="login__button"
        onClick={e => {
          setState(draft => {
            draft.mouseOver = false
            draft.clicked = !draft.clicked
          })
        }}
      >
        <FontAwesomeIcon className="login__icon" icon={faSignInAlt} />
      </div>

      <form onSubmit={handleSubmit} className={`form login__form${state.loginOpen ? " login__form--active" : ""}`}>
        <h3 className="form__title login__title">Login</h3>

        <FormInput
          form="login"
          type="text"
          name="username"
          placeholder="Username"
          value={undefined}
          onChange={e => {
            setState(draft => {
              draft.username = e.target.value
            })
          }}
          onFocus={() => {
            setState(draft => {
              draft.focused = true
            })
          }}
          onBlur={() => {
            setState(draft => {
              draft.focused = false
            })
          }}
        />
        <FormInput
          form="login"
          type="password"
          name="password"
          placeholder="Password"
          value={undefined}
          onChange={e => {
            setState(draft => {
              draft.password = e.target.value
            })
          }}
          onFocus={() => {
            setState(draft => {
              draft.focused = true
            })
          }}
          onBlur={() => {
            setState(draft => {
              draft.focused = false
            })
          }}
        />

        <FormSubmit disabled={state.submitting}>Login</FormSubmit>

        <Link
          to="/forgot-password"
          className="login__forgot"
          onClick={e =>
            setState(draft => {
              draft.loginOpen = !state.loginOpen
            })
          }
        >
          Forgot password?
        </Link>
      </form>
    </div>
  )
}

export default HeaderLoggedOut

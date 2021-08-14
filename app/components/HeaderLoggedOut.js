import React, {useEffect, useState, useContext} from "react"
import {Link} from "react-router-dom"
import Axios from "axios"
import {useImmer} from "use-immer"
import useCancelToken from "react-use-cancel-token"

//Contexts
import DispatchContext from "../contexts/DispatchContext"

//Components
import FormInput from "./form/FormInput"
import FormSubmit from "./form/FormSubmit"

function HeaderLoggedOut(props) {
  const appDispatch = useContext(DispatchContext)
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const [state, setState] = useImmer({
    username: "",
    password: "",
    submitting: false,
    submitCount: 0
  })

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
    <form onSubmit={handleSubmit} className="header__form login form form--inline">
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
      />

      <FormSubmit disabled={state.submitting}>Login</FormSubmit>

      <Link to="/forgot-password" className="login__forgot">
        Forgot
        <br />
        password?
      </Link>
    </form>
  )
}

export default HeaderLoggedOut

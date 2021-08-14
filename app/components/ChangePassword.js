import React, {useContext, useEffect} from "react"
import {withRouter, Redirect, Link} from "react-router-dom"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {useImmer} from "use-immer"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faTimes, faSave} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"

//Components
import Page from "./Page"
import FormInput from "./form/FormInput"
import FormSubmit from "./form/FormSubmit"

function ChangePassword(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const [state, setState] = useImmer({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    submitting: false,
    submitCount: 0
  })

  useEffect(() => {
    if (state.submitCount) {
      async function submitPassword(e) {
        cancelPreviousRequest()

        setState(draft => {
          draft.submitting = true
        })

        try {
          const response = await Axios.post(`/edit/user/${appState.user._id}/password`, {currentPassword: state.currentPassword, newPassword: state.newPassword, confirmPassword: state.confirmPassword, token: appState.user.token}, {cancelToken: newCancelToken()})

          if (response.data.success) {
            appDispatch({type: "flashMessage", value: response.data.message})
            setState(draft => {
              draft.submitting = false
            })
            props.history.push(`/user/${appState.user.slug}`)
          } else {
            throw new Error(response.data.message)
          }
        } catch (e) {
          if (isCancel(e)) {
            console.log(e)
            return
          }
          appDispatch({type: "flashMessage", value: e.message, warning: true})
          setState(draft => {
            draft.submitting = false
          })
          console.log(e)
        }
      }
      submitPassword()
    }
  }, [state.submitCount])

  if (!appState.user.token) {
    return <Redirect to={`/`} />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setState(draft => {
      draft.submitCount++
    })
  }

  return (
    <Page title="Change Password">
      <form onSubmit={handleSubmit} className="form change-password">
        <FormInput
          form="change-password"
          type="password"
          label="Current Password"
          name="current"
          onChange={e => {
            setState(draft => {
              draft.currentPassword = e.target.value
            })
          }}
        />

        <FormInput
          form="change-password"
          type="password"
          label="New Password"
          name="new"
          onChange={e => {
            setState(draft => {
              draft.newPassword = e.target.value
            })
          }}
        />

        <FormInput
          form="change-password"
          type="password"
          label="Confirm New Password"
          name="confirm"
          onChange={e => {
            setState(draft => {
              draft.confirmPassword = e.target.value
            })
          }}
        />

        <div className="form__buttons">
          <Link to={`/user/${appState.user.slug}`} className="button button--cancel">
            Cancel <FontAwesomeIcon icon={faTimes} />
          </Link>

          <FormSubmit disabled={state.submitting}>
            Update password <FontAwesomeIcon icon={faSave} />
          </FormSubmit>
        </div>
      </form>
    </Page>
  )
}

export default withRouter(ChangePassword)

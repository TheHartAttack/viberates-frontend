import React, {useEffect, useContext, useRef} from "react"
import {withRouter, Redirect, Link} from "react-router-dom"
import {useImmer} from "use-immer"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faUser} from "@fortawesome/free-solid-svg-icons"
import io from "socket.io-client"
import _ from "lodash"
import moment from "moment"

//Contexts
import StateContext from "../contexts/StateContext"

//Components
import Page from "./Page"
import Loading from "./Loading"

function Chat() {
  const socket = useRef(null)
  const appState = useContext(StateContext)
  const chatMessages = useRef(null)
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const [state, setState] = useImmer({
    newMessage: "",
    messages: [],
    moreMessages: false,
    loading: false,
    loadCount: 0,
    submitting: false,
    submitCount: 0,
    scrollToBot: true,
    scrollPosition: 0
  })

  useEffect(() => {
    async function getChatMessages() {
      cancelPreviousRequest()

      try {
        setState(draft => {
          draft.loading = true
        })

        const response = await Axios.post("/load-chat", {offset: state.messages.length, token: appState.user.token}, {cancelToken: newCancelToken()})

        if (response.data.success) {
          response.data.messages.map(message => {
            message.date = new Date(message.date)
          })

          shouldScroll()

          setState(draft => {
            draft.messages = response.data.messages.concat(draft.messages)
            draft.moreMessages = response.data.moreMessages
            draft.loading = false
          })
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
          draft.loading = false
        })
        console.log(e)
      }
    }
    getChatMessages()
  }, [state.loadCount])

  useEffect(() => {
    socket.current = io(process.env.BACKENDURL || "https://viberates.onrender.com")

    socket.current.on("chatFromServer", message => {
      shouldScroll()
      setState(draft => {
        draft.messages.push(message)
      })
    })

    return () => socket.current.disconnect()
  }, [])

  useEffect(() => {
    if (state.scrollToBot) {
      chatMessages.current.scrollTop = chatMessages.current.scrollHeight
    } else {
      chatMessages.current.scrollTop = chatMessages.current.scrollHeight - state.scrollPosition - chatMessages.current.offsetHeight
    }
  }, [state.messages])

  function shouldScroll() {
    if (chatMessages.current.offsetHeight + chatMessages.current.scrollTop == chatMessages.current.scrollHeight) {
      setState(draft => {
        draft.scrollToBot = true
      })
    } else {
      setState(draft => {
        draft.scrollToBot = false
      })
    }
  }

  function handleFieldChange(e) {
    const value = e.target.value
    setState(draft => {
      draft.newMessage = value
    })
  }

  function handleScroll(e) {
    if (!state.loading && state.moreMessages && chatMessages.current.scrollTop == 0) {
      setState(draft => {
        draft.scrollPosition = chatMessages.current.scrollHeight - chatMessages.current.offsetHeight
        draft.loadCount++
      })
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    socket.current.emit("chatFromBrowser", {message: state.newMessage, token: appState.user.token})

    setState(draft => {
      draft.scrollToBot = true
      draft.messages.push({
        body: draft.newMessage,
        date: new Date(),
        user: {
          username: appState.user.username,
          slug: appState.user.slug,
          image: appState.user.image
        }
      })
      draft.newMessage = ""
    })
  }

  if (!appState.user.token || appState.user.suspended) {
    return <Redirect to={`/`} />
  }

  return (
    <Page title="Chat">
      <div className="chat">
        <div onScroll={_.debounce(handleScroll, 250)} ref={chatMessages} className="chat__messages">
          {state.loading && <Loading className="chat__loading" fontSize="16" />}

          {state.moreMessages && !state.loading && (
            <button
              className="chat__load button"
              onClick={e => {
                setState(draft => {
                  draft.loadCount++
                })
              }}
            >
              Load more
            </button>
          )}

          {state.messages.map((message, index) => {
            return (
              <div className="chat__message" key={index}>
                {message.user.image ? (
                  <img className="chat__image" src={message.user.image} alt={message.user.username} />
                ) : (
                  <div className="chat__no-image">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                )}

                <div className="chat__inner">
                  <Link to={`/user/${message.user.slug}`} className="chat__username">
                    {message.user.username}
                  </Link>
                  <span className="chat__datetime">{moment(message.date).calendar()}</span>
                  <span className="chat__body">{message.body}</span>
                </div>
              </div>
            )
          })}
        </div>

        <form onSubmit={handleSubmit} className="chat__form">
          <input onChange={handleFieldChange} value={state.newMessage} type="text" className="chat__input" placeholder="Type a message..." autoFocus disabled={state.submitting} />
          <button className="chat__submit button">Post</button>
        </form>
      </div>
    </Page>
  )
}

export default withRouter(Chat)

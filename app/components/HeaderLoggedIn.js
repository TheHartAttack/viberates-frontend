import React, {useContext, useState} from "react"
import {Link} from "react-router-dom"
import {useImmer} from "use-immer"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faUser, faComment, faSignOutAlt} from "@fortawesome/free-solid-svg-icons"

//Contexts
import DispatchContext from "../contexts/DispatchContext"
import StateContext from "../contexts/StateContext"

function HeaderLoggedIn(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const [state, setState] = useImmer({
    menuOpen: false
  })

  function handleLogout() {
    appDispatch({type: "logout"})
    appDispatch({type: "flashMessage", value: "Logged out."})
  }

  return (
    <div
      className={`header__button user${state.menuOpen ? " user--active" : ""} `}
      onMouseEnter={e =>
        setState(draft => {
          draft.menuOpen = true
        })
      }
      onMouseLeave={e =>
        setState(draft => {
          draft.menuOpen = false
        })
      }
      onClick={e =>
        setState(draft => {
          draft.menuOpen = !draft.menuOpen
        })
      }
    >
      <div className="user__image">{appState.user.image ? <img src={appState.user.image} alt="" /> : <FontAwesomeIcon icon={faUser} />}</div>
      <ul className={`user__menu${state.menuOpen ? " user__menu--active" : ""}`}>
        <li>
          <Link to={`/user/${appState.user.slug}`} className="user__menu-button">
            Profile <FontAwesomeIcon icon={faUser} />
          </Link>
        </li>

        <li>
          <Link to={"/chat"} className="user__menu-button">
            Chat <FontAwesomeIcon icon={faComment} />
          </Link>
        </li>

        <li>
          <button className="user__menu-button" onClick={handleLogout}>
            Logout
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
        </li>
      </ul>
    </div>
  )
}

export default HeaderLoggedIn

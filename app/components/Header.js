import React, {useContext} from "react"
import {Link} from "react-router-dom"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faSearch} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"

//Components
import HeaderLoggedOut from "./HeaderLoggedOut"
import HeaderLoggedIn from "./HeaderLoggedIn"

function Header(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const headerContent = appState.loggedIn ? <HeaderLoggedIn /> : <HeaderLoggedOut />

  function handleSearchIcon(e) {
    e.preventDefault()
    appDispatch({type: "openSearch"})
  }

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__title">
          <Link to="/" className="header__title-link">
            <span>
              <span className="header__vibe">
                V<span className="header__ibe">IBE</span>
              </span>
              <span className="header__rates">
                R<span className="header__ates">ATES</span>
              </span>
            </span>
          </Link>
        </div>

        {!props.staticEmpty ? headerContent : ""}

        <div className="header__search" onClick={handleSearchIcon}>
          <FontAwesomeIcon icon={faSearch} />
        </div>
      </div>
    </header>
  )
}

export default Header

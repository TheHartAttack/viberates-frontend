function mainReducer(draft, action) {
  switch (action.type) {
    case "login":
      draft.loggedIn = true
      draft.user = action.data
      return
    case "logout":
      draft.loggedIn = false
      return
    case "flashMessage":
      draft.flashMessages.push({value: action.value, warning: action.warning})
      return
    case "openSearch":
      draft.searchOpen = true
      return
    case "closeSearch":
      draft.searchOpen = false
      return
    case "setSize":
      draft.size = action.value
      return
    case "updateImage":
      draft.user.image = action.value
      localStorage.setItem("viberatesUserImage", action.value)
      return
  }
}

export default mainReducer

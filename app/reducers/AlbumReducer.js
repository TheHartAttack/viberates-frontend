function albumReducer(draft, action) {
  switch (action.type) {
    case "startLoading":
      draft.isLoading = true
      return

    case "finishLoading":
      draft.isLoading = false
      return

    case "setColNum":
      draft.colNum = action.data
      return

    case "setAlbumData":
      draft.albumData = action.data
      draft.loading = false
      return

    case "setAlbumTitle":
      draft.albumData.title = action.data
      return

    case "setAlbumReleaseDate":
      draft.albumData.releaseDate = action.data
      return

    case "setAlbumType":
      draft.albumData.type = action.data
      return

    case "setAlbumPreview":
      draft.albumData.preview = action.data
      return

    case "setAlbumImage":
      draft.albumData.image = action.data
      return
  }
}

export default albumReducer

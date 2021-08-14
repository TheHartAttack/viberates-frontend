import React, {useEffect, useState, useRef} from "react"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faImage, faTrashAlt, faFileUpload} from "@fortawesome/free-solid-svg-icons"

function ImageInput(props) {
  const input = useRef(null)

  function handleImage(e) {
    if (e.target.files[0]) {
      props.setState(draft => {
        draft.preview = URL.createObjectURL(e.target.files[0])
        draft.image = e.target.files[0]
      })
    }
  }

  function deleteImage(e) {
    input.current.value = ""
    props.setState(draft => {
      draft.preview = ""
      draft.image = ""
    })
  }

  return (
    <div className="form__group image-input">
      <label className="form__label" htmlFor={`${props.form ? `${props.form}-` : ""}${props.name}`}>
        {props.label}
      </label>
      <div className="image-input__buttons">
        <label className={`image-input__label ${props.preview ? "image-input__label--narrow" : ""}`} htmlFor={`${props.form ? `${props.form}-` : ""}${props.name}`}>
          <FontAwesomeIcon icon={faFileUpload} />
          <input onChange={handleImage} ref={input} className="image-input__file" type="file" name={props.name} id={`${props.form ? `${props.form}-` : ""}${props.name}`} />
        </label>
        {props.preview ? (
          <button onClick={deleteImage} className="image-input__delete" type="button">
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
        ) : (
          ""
        )}
      </div>
      {props.preview ? <img className="image-input__preview" src={props.preview} alt={props.image ? props.image.name : props.name} /> : ""}
    </div>
  )
}

export default ImageInput

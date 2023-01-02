import React, {useEffect, useState, useContext, useRef} from "react"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faImage, faTrashAlt, faFileUpload} from "@fortawesome/free-solid-svg-icons"

function ImageInput(props) {
  const input = useRef("")

  function handleImage(e) {
    if (e.target.files[0]) {
      props.dispatch({type: "setEditPreview", data: URL.createObjectURL(e.target.files[0])})
      props.dispatch({type: "setEditImage", data: e.target.files[0]})
    }
  }

  function deleteImage(e) {
    input.current.value = ""
    props.dispatch({type: "setEditPreview", data: ""})
    props.dispatch({type: "setEditImage", data: ""})
  }

  return (
    <div className={`form__group image-input ${props.className ? `${props.className}__image-input` : ""}`}>
      <label className="form__label" htmlFor={`${props.form ? `${props.form}-` : ""}${props.name}`}>
        {props.label}
      </label>
      {props.preview ? (
        <img className="image-input__preview" src={props.preview} alt={props.image.name ? props.image.name : props.name} />
      ) : (
        <div className={`image-input__placeholder ${props.className ? `${props.className}__image-placeholder` : ""}`}>
          <FontAwesomeIcon icon={faImage} />
        </div>
      )}
      <div className="image-input__buttons">
        <label className={`image-input__label`} htmlFor={`${props.form ? `${props.form}-` : ""}${props.name}`}>
          <FontAwesomeIcon icon={faFileUpload} />
          <input onChange={handleImage} ref={input} className="image-input__file" type="file" name={props.name} id={`${props.form ? `${props.form}-` : ""}${props.name}`} />
        </label>

        <button onClick={deleteImage} className={`image-input__delete ${props.className ? `${props.className}__image-delete` : ""}`} type="button" disabled={!props.preview}>
          <FontAwesomeIcon icon={faTrashAlt} />
        </button>
      </div>
    </div>
  )
}

export default ImageInput

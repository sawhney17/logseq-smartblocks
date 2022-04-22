import React, { useState } from "react";
import "./App.css";
import "@logseq/libs";
import ReactTooltip from "react-tooltip";

import "./tailwind.css";
import { smartblocks } from "./searchbar";
const InsertionUI: React.FC <{blockUUID}> = (blockUUID) => {
  const [location, setLocation] = React.useState("");
  const [sibling, setSibling] = React.useState("false");
  const [title, setTitle] = React.useState("");
  const [smartblockIndex, setSmartblockIndex] = React.useState(1)
  const handleChange = (e) => {
    console.log(e.target.id)
    if (e.target.id == "locationInput"){
      setLocation(e.target.value)
    }
    if (e.target.id == "titleInput"){
      setTitle(e.target.value)
    }

    if (e.target.id == "siblignSelect"){
      setSibling(e.target.value)
    }
    if (e.target.id == "templateSelection"){
      setSmartblockIndex(e.target.value)
    }
  }

  const handleSubmit = async() =>{
    let finalString;
    setLocation(location.replaceAll("(", "").replaceAll(")", ""))
    let newTitle = title
    if (title==""){
      console.log("his")
      newTitle = "New Smartblock"
    }
    if (location.length > 0){
      finalString = `{{renderer :smartblock, ${smartblocks[smartblockIndex]}, ${newTitle}, ${sibling}, ${location}}}`
    }
    else {
      finalString = `{{renderer :smartblock, ${smartblocks[smartblockIndex]}, ${newTitle}, ${sibling}}}`
    }
    console.log(blockUUID.blockUUID)
    // let block = (await logseq.Editor.getBlock(blockUUID.blockUUID)).content
    // logseq.Editor.updateBlock(blockUUID.blockUUID, `${block} ${finalString}`)
    logseq.Editor.insertAtEditingCursor(finalString)
    logseq.hideMainUI()
  }
  return (
    <div className="flex justify-center w-screen z-0">
      <div className="smartblock-inserter max-w-lg">
        <h1 className="text-xl font-bold">Insert Smartblock</h1>
        <form className="">
          <div className="grid grid-cols-2 pb-2">
          <div className="flex justify-between">
            <h1 className="inline-block">Location</h1>
            <p className="inline-block pr-2 text-sm" data-tip="<p>Takes an optional input of a block ID in the form <code>((62623fd6-d3ff-4ba4-a64e-0492d3926581)).</code>, a page name or a daily note page(parsed using NLP). Clicking the button will insert a block under the defined block/page. By default, it will insert template under the rendered button</p>" data-html={true}>?</p> <ReactTooltip html={true} />
          </div>
          <input id="locationInput" className="text-black" value ={location} onChange={handleChange}></input>
          </div>
          <div className="grid grid-cols-2 pb-2">
          <div className="flex justify-between">
            <h1 className="inline-block">Title</h1>
            <p className="inline-block pr-2 text-sm" data-tip="<p>Title to be displayed on the generated button</p>" data-html={true}>?</p> <ReactTooltip html={true} />
          </div>
          <input id="titleInput" className="text-black" value ={title} onChange={handleChange}></input>
          </div>
          <div className="grid grid-cols-2 pb-2">
          <div className="flex justify-between">
            <h1 className="inline-block">Sibling?</h1>
            <p className="inline-block pr-2 text-sm" data-tip="<p>Would you like the template to be inserted as a sibling or a child? (indented under or not indented under?)</p>" data-html={true}>?</p> <ReactTooltip html={true} />
          </div>
          <select id="siblignSelect" className="text-black"
        onChange={(event) => handleChange(event)}
        value={sibling}
      >
        <option value="true">Insert as Sibling</option>
        <option value="false">Insert as Child</option>
      </select>
          </div>
          <div className="grid grid-cols-2 pb-2">
          <div className="flex justify-between">
            <h1 className="inline-block">Template</h1>
            <p className="inline-block pr-2 text-sm" data-tip="<p>Template to be inserted. To create a smartblock template, just right click a bullet and click the make template button</p>" data-html={true}>?</p> <ReactTooltip html={true} />
          </div>
          <select
          className="text-black"
          id="templateSelection"
          onChange={(event) => handleChange(event)}
          value={smartblockIndex}
          >
            {smartblocks.map((value, index)=>{
              return <option value={index}>{value}</option>
            })}
          </select>
          </div>
        </form>
        <div><button className="button submit grid-child" onClick={handleSubmit}>Submit</button></div>
      </div>

    </div>
  );
};

export default InsertionUI;

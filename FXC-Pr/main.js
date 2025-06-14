/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2024 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it. If you have received this file from a source other than Adobe,
 * then your use, modification, or distribution of it requires the prior
 * written permission of Adobe.
 **************************************************************************/

//global objects.
const ppro = require("premierepro");

const log = (msg, color) =>
  (document.getElementById("plugin-body").innerHTML += color
    ? `<span style='color:${color}'>${msg}</span><br />`
    : `${msg}<br />`);

const clearLog = (msg, color) =>
  (document.getElementById("plugin-body").innerHTML = "");

async function poplulateApplicationInfo() {
  const project = await ppro.Project.getActiveProject();
  if (!project) {
    log("There is no active project found", "red");
  } else {
    log(`Active project: ${project.name}`);
    const sequence = await project.getActiveSequence();
    if (!sequence) {
      log("There is no active sequence found", "red");
    } else {
      log(`Active sequence: ${sequence.name}`);
    }
  }
}

document
  .querySelector("#btnPopulate")
  .addEventListener("click", poplulateApplicationInfo);

document.querySelector("#clear-btn").addEventListener("click", clearLog);

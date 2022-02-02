import '@logseq/libs'
import {
  IBatchBlock,
} from '@logseq/libs/dist/LSPlugin.user';
import Sherlock from 'sherlockjs';
import {getDateForPage } from 'logseq-dateutils';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { handleClosePopup } from './handleClosePopup';
import { insertProperlyTemplatedBlock } from './insertTemplatedBlock';
/*
* main entry
*/


async function main () {
  }
    logseq.provideModel({
        async insertTemplatedBlock (e: any) {
          const { blockUuid, template, sibling } = e.dataset
            insertProperlyTemplatedBlock(blockUuid, template, sibling)
            
        }
    }),

    logseq.App.registerCommandPalette(
      {
        key: 'logseq-noTODO-plugin',
        label: "Quick todo to today's journal page",
        keybinding: {
          binding: 'm t',
        },
      },
      () => {
        logseq.showMainUI();
  
        document.addEventListener('keydown', (e: any) => {
          if (e.keyCode !== 27) {
            (document.querySelector('.task-field') as HTMLElement).focus();
          }
        });
      }
    );
    

    logseq.provideStyle(`
    .templater-btn {
       border: 1px solid var(--ls-border-color); 
       white-space: initial; 
       padding: 2px 4px; 
       border-radius: 4px; 
       user-select: none;
       cursor: default;
       display: flex;
       align-content: center;
    }
    
    .templater-btn:hover {
        background-color: #defcf0;
        border-color: #9ddbc7;
        color: #0F9960;
    }
  `)
  logseq.Editor.registerSlashCommand('Create SmartBlock', async () => {
    await logseq.Editor.insertAtEditingCursor(`{{renderer :smartblock, , }} `);
    // templaterBlock = await logseq.Editor.getCurrentBlock();
  });
      logseq.Editor.registerSlashCommand('Create Inline  SmartBlock', async () => {
        await logseq.Editor.insertAtEditingCursor(`{{renderer :smartblockInline, }} `);
        // templaterBlock = await logseq.Editor.getCurrentBlock();
      });
      logseq.Editor.registerSlashCommand('Create Inline SmartBlock(guided)', async () => {
        await logseq.Editor.insertAtEditingCursor(`{{renderer :smartblockInline, template name}} `);
        // templaterBlock = await logseq.Editor.getCurrentBlock();
      });
        
      logseq.Editor.registerSlashCommand('Create SmartBlock (guided)', async () => {
        await logseq.Editor.insertAtEditingCursor(`{{renderer :smartblock, template name, button title, sibling?}} `);
        // templaterBlock = await logseq.Editor.getCurrentBlock();
      });

      logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
        var [type, template, title, sibling] = payload.arguments;
        if (title == undefined){
          title = "New Template"
        }
        let realSiblings;
        if (sibling == "true"){
           realSiblings = true
        }
        else{
           realSiblings = false
        }

        if (type ==':smartblock'){
        logseq.provideUI({
            key: 'SmartBlocks for Logseq',
            reset: true,
            slot,
            template: `
            <button class="templater-btn" data-block-uuid="${payload.uuid}" data-sibling = ${realSiblings} data-template="${template}" data-title="${title}"
            data-on-click="insertTemplatedBlock">${title}</button>
           `,
          });
        }
        if (type ==':smartblockInline'){
          await insertProperlyTemplatedBlock(payload.uuid, template, "true")
          logseq.Editor.removeBlock(payload.uuid)
          }
      });

      handleClosePopup()
      ReactDOM.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
        document.getElementById('app')
      );


logseq.ready(main).catch(console.error)
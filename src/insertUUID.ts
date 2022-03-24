import '@logseq/libs'

export function persistUUID(uuid) {
    logseq.Editor.getBlock(uuid, { includeChildren: true }).then(
        (result) => {
            if (!result.content.match(/(id:: .*)/g)){
                const finalContent = result.content + `\nid:: ${result.uuid}`
                logseq.Editor.updateBlock(result.uuid, finalContent)
            }
        })

}
src/ 
  pages/
    index.js                      # redirect to /chat
    chat/
      index.js                    # chat home (latest / new session)
      [sessionId].js              # chat session view
    datasets/
      index.js                    # data library (import/export/search)
      [datasetId].js              # dataset details
    tools/
      index.js                    # tool registry
      [toolId].js                 # tool detail
    models/
      index.js                    # models + routing overview
    tags/
      index.js                    # tag management
    prompts/
      index.js                    # prompt studio
    settings/
      index.js                    # user settings
    admin/
      index.js                    # admin dashboard (optional)

  components/
    shell/
      AppShell.js                 # layout wrapper (sidebar/topbar)
      Sidebar.js                  # navigation + sessions
      Topbar.js                   # header actions/search
      SplitPane.js                # resizable panes
      CommandPalette.js           # ⌘K palette

    chat/
      ChatWorkspace.js            # main chat container
      SessionList.js
      SessionListItem.js
      MessageList.js
      MessageCard.js
      Composer.js                 # input + send
      TagSelector.js              # tag chips/dropdown
      ModelPicker.js              # auto + override
      AttachmentTray.js           # files/images
      TypingIndicator.js

    inspector/
      InspectorPanel.js           # right panel
      MessageMeta.js              # tag/model/tokens/latency
      ToolTraceViewer.js          # tool calls view
      RetrievalViewer.js          # sources/citations for datasets/RAG
      RetryControls.js            # retry with tag/model

    datasets/
      DatasetGrid.js
      DatasetCard.js
      DatasetUpload.js
      DatasetSearchPanel.js
      DatasetExportPanel.js
      DatasetDetailHeader.js

    tools/
      ToolList.js
      ToolCard.js
      ToolDetail.js
      ToolSchemaViewer.js
      ToolRunPanel.js
      ToolLogsTable.js

    models/
      ModelList.js
      ModelCard.js
      RoutingTable.js             # tag -> model mapping UI
      ModelParamsPanel.js

    tags/
      TagBadge.js
      TagList.js
      TagEditor.js
      TagRulesEditor.js           # priority/conflicts/permissions

    prompts/
      PromptTemplateList.js
      PromptEditor.js
      RefinePromptDiff.js
      SystemInstructionEditor.js

    ui/
      Button.js
      Card.js
      Tabs.js
      Drawer.js
      Dialog.js
      Tooltip.js
      Badge.js
      DataTable.js
      Toast.js
      Spinner.js
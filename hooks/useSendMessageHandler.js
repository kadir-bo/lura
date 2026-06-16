import { useCallback } from "react";

export const useSendMessageHandler = (
  sendMessage,
  attachments,
  conversationId,
  createConversation,
  updateConversation,
  addMessage,
  getMessages,
  addConversationToProject,
  getProjectConversations,
  updateUserProfile,
  updateProjectMemory,
  userProfile,
  project_id,
  project,
  router,
  textareaRef,
  selectedModel,
) => {
  return useCallback(
    async (message) => {
      if (!message?.trim() && attachments.length === 0) return;

      await sendMessage({
        message,
        conversationId,
        model: selectedModel || userProfile?.preferences?.defaultModel || "meta/llama-3.1-8b-instruct",
        createConversation,
        updateConversation,
        addMessage,
        addConversationToProject,
        getMessages,
        getProjectConversations,
        updateUserProfile,
        updateProjectMemory,
        userProfile,
        projectId: typeof project_id === "string" ? project_id : project_id?.id,
        project,
        router,
        onSuccess: () => {
          // Refocus so the user can type immediately after a response.
          textareaRef.current?.focus();
        },
      });
    },
    [
      sendMessage,
      attachments.length,
      conversationId,
      createConversation,
      updateConversation,
      addMessage,
      addConversationToProject,
      getMessages,
      getProjectConversations,
      updateUserProfile,
      updateProjectMemory,
      userProfile,
      project_id,
      project,
      router,
      textareaRef,
      selectedModel,
    ],
  );
};

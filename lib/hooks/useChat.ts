import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { UIMessage, useChat } from "@ai-sdk/react";

interface UseAppChatProps {
	initialMessages?: UIMessage[];
	chatId?: string | null;
	onNewChatCreated?: (chatId: string) => void;
}

export function useAppChat({
	initialMessages,
	chatId,
	onNewChatCreated,
}: UseAppChatProps) {
	const searchParams = useSearchParams();

	useEffect(() => {
		const error = searchParams.get("error");
		if (error) {
			toast.error(error);
		}
	}, [searchParams]);

	const {
		messages,
		input,
		handleInputChange,
		handleSubmit,
		isLoading,
		append,
	} = useChat({
		api: "/api/scraping/task",
		initialMessages,
		id: chatId,
		onResponse: (response) => {
			if (response.status === 401) {
				toast.error(response.statusText);
			}
		},
		onFinish: (message) => {
			if (onNewChatCreated && !chatId) {
				const newChatId = message.id;
				onNewChatCreated(newChatId);
			}
		},
	});

	return {
		messages,
		input,
		setInput: handleInputChange,
		handleSendMessage: handleSubmit,
		isSending: isLoading,
		append,
	};
}

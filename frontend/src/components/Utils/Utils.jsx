export const selectChatUsers = (userExists, selectedUser, chatUsers) => {
  let updatedChatUsers = [];

  if (!userExists) {
    updatedChatUsers = [selectedUser, ...chatUsers].map((user) => {
      if (user.receiver._id === selectedUser.receiver._id) {
        return { ...user, isActive: true };
      }
      return { ...user, isActive: false };
    });
  } else {
    updatedChatUsers = chatUsers.map((user) => {
      if (user.receiver._id === selectedUser.receiver._id) {
        return { ...user, isActive: true };
      }
      return { ...user, isActive: false };
    });
  }

  return updatedChatUsers;
};

export const selectedActiveUserChat = (receiverId, chatUsers) => {
  return chatUsers.map((user) => {
    if (receiverId === user.receiver._id) {
      return { ...user, isActive: true };
    }
    return { ...user, isActive: false };
  });
};

export const transformUserChatData = (data, id) => {
  if (Array.isArray(data)) {
    return data.map((item) => {
      return {
        chatId: item._id,
        user: item.members.find((item) => item._id === id),
        receiver: item.members.find((item) => item._id !== id),
        latestMessage: item.latestMessage
          ? {
              _id: item.latestMessage._id,
            }
          : {},
        isActive: false,
      };
    });
  }
  return {
    chatId: data._id,
    user: data.members.find((item) => item._id === id),
    receiver: data.members.find((item) => item._id !== id),
    latestMessage: data.latestMessage
      ? {
          _id: data.latestMessage._id,
        }
      : {},
    isActive: true,
  };
};

export const findSelectedUserDetails = (id, data) => {
  return data.filter((item) => id === item.receiver._id)[0];
};

export const userAvatar = (string) => {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
};

export const transformMessage = (data) => {
  return {
    chatId: data.chatId._id,
    user: data.chatId.members.find((item) => data.senderId === item._id),
    receiver: data.chatId.members.find((item) => data.senderId !== item._id),
    senderId: data.senderId,
    latestMessage: data.chatId.latestMessage
      ? {
          _id: data.chatId.latestMessage,
        }
      : {},
    isActive: false,
  };
};

export const transformMessageIntoChat = (data) => {
  return {
    chatId: data.chatId,
    user: data.receiver,
    receiver: data.user,
    latestMessage: data.latestMessage,
    isActive: false,
  };
};

export const transformMessageData = (data, userId) => {
  return data.map((item) => {
    const createdAt = item.createdAt;

    const createdAtDate = new Date(createdAt);

    const nowDate = Date.now();

    const diff = nowDate - createdAtDate.getTime();

    const twoMinutes = 2 * 60 * 1000;

    const isOlderThanTwoMin = diff > twoMinutes;

    if (item.senderId === userId) {
      return { ...item, isOlder: isOlderThanTwoMin };
    }
    return item;
  });
};

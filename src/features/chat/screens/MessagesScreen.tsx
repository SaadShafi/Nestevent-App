import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { EmptyState, Header, IconButton, Screen, SearchBar, useToast } from '@/components/ui';
import { findUser } from '@/data/mock';
import { useChatStore } from '@/store';
import { colors } from '@/theme';

import { ConversationRow } from '../components/ConversationRow';

/** Conversation list with search. */
export function MessagesScreen() {
  const router = useRouter();
  const toast = useToast();
  const conversations = useChatStore((s) => s.conversations);
  const markRead = useChatStore((s) => s.markRead);
  const [query, setQuery] = useState('');

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...conversations]
      .filter((c) => !q || findUser(c.participantId).displayName.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
  }, [conversations, query]);

  return (
    <Screen glow>
      <Header
        title="Messages"
        right={
          <IconButton
            name="information-circle"
            onPress={() => toast('Messages are end-to-end private between you and the organizer.', 'info')}
            accessibilityLabel="About messages"
          />
        }
      />
      <SearchBar tone="dark" value={query} onChangeText={setQuery} containerStyle={styles.search} />
      <FlatList
        data={data}
        keyExtractor={(c) => c.id}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={<EmptyState icon="chatbubbles-outline" title="No conversations" message="Messages with organizers and friends will show up here." />}
        renderItem={({ item }) => (
          <ConversationRow
            conversation={item}
            onPress={() => {
              markRead(item.id);
              router.push({ pathname: '/messages/[id]', params: { id: item.id } });
            }}
          />
        )}
      />
    </Screen>
  );
}

export default MessagesScreen;

const styles = StyleSheet.create({
  search: { marginBottom: 8 },
  list: { paddingBottom: 32 },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderSoft },
});

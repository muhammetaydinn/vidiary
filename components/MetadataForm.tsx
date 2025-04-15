import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Button, Text } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as z from 'zod';

// Define the Zod schema for validation
const metadataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type MetadataFormData = z.infer<typeof metadataSchema>;

interface MetadataFormProps {
  initialData?: Partial<MetadataFormData>;
  onSubmit: (data: MetadataFormData) => void;
  submitButtonText?: string;
}

export const MetadataForm: React.FC<MetadataFormProps> = ({
  initialData = {},
  onSubmit,
  submitButtonText = 'Save',
}) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const [formData, setFormData] = useState<Partial<MetadataFormData>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof MetadataFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for the field being changed
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = () => {
    const result = metadataSchema.safeParse(formData);
    if (result.success) {
      onSubmit(result.data);
      setErrors({});
    } else {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Name</ThemedText>
        <TextInput
          style={[
            styles.input,
            { 
              borderColor: errors.name ? 'red' : themeColors.border,
              color: themeColors.text,
              backgroundColor: themeColors.inputBackground,
            },
          ]}
          value={formData.name || ''}
          onChangeText={(value) => handleChange('name', value)}
          placeholder="Enter video name"
          placeholderTextColor={themeColors.placeholder}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Description (Optional)</ThemedText>
        <TextInput
          style={[
            styles.textArea,
            { 
              borderColor: errors.description ? 'red' : themeColors.border,
              color: themeColors.text,
              backgroundColor: themeColors.inputBackground,
            },
          ]}
          value={formData.description || ''}
          onChangeText={(value) => handleChange('description', value)}
          placeholder="Enter video description"
          placeholderTextColor={themeColors.placeholder}
          multiline
          numberOfLines={4}
        />
        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
      </ThemedView>

      <Button title={submitButtonText} onPress={handleSubmit} color={themeColors.tint} />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: 'red',
    marginTop: 4,
    fontSize: 12,
  },
});

// Add inputBackground and placeholder colors to Colors.ts if they don't exist
// Example for Colors.ts:
// export const Colors = {
//   light: {
//     // ... other colors
//     border: '#ccc',
//     inputBackground: '#f0f0f0',
//     placeholder: '#999',
//   },
//   dark: {
//     // ... other colors
//     border: '#555',
//     inputBackground: '#333',
//     placeholder: '#777',
//   },
// };

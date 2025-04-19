import React, { useState } from 'react';
import { TextInput, Text, TouchableOpacity } from 'react-native';
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
  disabled?: boolean;
}

export const MetadataForm: React.FC<MetadataFormProps> = ({
  initialData = {},
  onSubmit,
  submitButtonText = 'Save',
  disabled = false,
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
    <ThemedView className="p-[16px]">
      <ThemedView className="mb-[16px]">
        <ThemedText className="mb-[8px] text-[16px]">Name</ThemedText>
        <TextInput
          className={`border rounded-[8px] p-[12px] text-[16px] ${errors.name ? 'border-red-500' : ''
            }`}
          value={formData.name || ''}
          onChangeText={(value) => handleChange('name', value)}
          placeholder="Enter video name"
          placeholderTextColor={themeColors.placeholder}
          style={{
            borderColor: errors.name ? 'red' : themeColors.border,
            color: themeColors.text,
            backgroundColor: themeColors.inputBackground,
          }}
        />
        {errors.name && <Text className="text-red-500 mt-[4px] text-[12px]">{errors.name}</Text>}
      </ThemedView>

      <ThemedView className="mb-[16px]">
        <ThemedText className="mb-[8px] text-[16px]">Description (Optional)</ThemedText>
        <TextInput
          className={`border rounded-[8px] p-[12px] text-[16px] h-[100px] ${errors.description ? 'border-red-500' : ''
            }`}
          value={formData.description || ''}
          onChangeText={(value) => handleChange('description', value)}
          placeholder="Enter video description"
          placeholderTextColor={themeColors.placeholder}
          multiline
          numberOfLines={4}
          style={{
            borderColor: errors.description ? 'red' : themeColors.border,
            color: themeColors.text,
            backgroundColor: themeColors.inputBackground,
            textAlignVertical: 'top',
          }}
        />
        {errors.description && <Text className="text-red-500 mt-[4px] text-[12px]">{errors.description}</Text>}
      </ThemedView>

      <TouchableOpacity
        className="relative top-[10px] m-[20px] bg-white border-2 border-black px-[10px] py-[5px] rounded-[5px] flex justify-center items-center shadow-2xl"
        onPress={handleSubmit}
        disabled={disabled}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.5,
          shadowRadius: 40,
          elevation: 5,
          opacity: disabled ? 0.5 : 1, // Reduce opacity when disabled
        }}
      >
        <ThemedText className="text-black">{submitButtonText}</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

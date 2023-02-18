import React from 'react';
import {
  Box,
  Stack,
  Select,
  Paper,
  TextInput,
  Button,
  Text,
  Group,
  Textarea,
  NumberInput,
  Switch,
} from '@mantine/core';

interface BulkEditAction {
  type: string;
  value: any;
}

interface BulkEditActionSelectorProps {
  value: BulkEditAction[];
  onChange: (value: BulkEditAction[]) => void;
  disabled: boolean;
}

export default function BulkEditActionSelector({
  value,
  onChange,
  disabled,
}: BulkEditActionSelectorProps) {
  const options = [
    { label: 'Change Name', value: 'name', type: 'text' },
    { label: 'Change Description', value: 'description', type: 'textarea' },
    { label: 'Change Starting Price', value: 'starting-price', type: 'price' },
    { label: 'Change Visibility', value: 'hidden', type: 'boolean' },
  ];
  const remainingOptions = options.filter((option) => !value.some((v) => v.type === option.value));

  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [selectedOptionType, setSelectedOptionType] = React.useState<string | null>(null);
  const [selectedOptionInput, setSelectedOptionInput] = React.useState<any>(null);
  
  React.useEffect(() => {
    if (selectedOption) {
      const option = options.find((option) => option.value === selectedOption);
      if (option) {
        setSelectedOptionType(option.type);
      }
    } else {
      setSelectedOptionType(null);
    }
  }, [selectedOption]);

  const onAddChange = () => {
    if (!onChange) return;
    if (!selectedOption) return;
    onChange([
      ...value,
      {
        type: selectedOption,
        value: selectedOptionInput,
      }
    ]);

    // Clear the selected option
    setSelectedOption(null);
    setSelectedOptionInput(null);
  }

  const onRemoveChange = (index: number) => {
    if (!onChange) return;
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <Box>
      <Stack>
        {
          value.length > 0 ? (
            <Box>
              <Stack>
                {
                  value.map((action, index) => {
                    const option = options.find((option) => option.value === action.type);
                    if (!option) return null;

                    let parseValue = action.value;

                    if (option.type == 'price') {
                      parseValue = `$ ${action.value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    } else if (option.type == 'boolean') {
                      parseValue = action.value ? 'On' : 'Off';
                    }

                    return (
                      <Paper
                        key={index}
                        p="md"
                        shadow="sm"
                      >
                        <Group
                          sx={{
                            justifyContent: 'space-between',
                          }}
                        >
                          <Stack spacing={4}>
                            <Text fw="bold">{option.label}</Text>
                            <Text>{parseValue}</Text>
                          </Stack>
                          <Button
                            color="red"
                            onClick={() => onRemoveChange(index)}
                            disabled={disabled}
                          >
                            Remove
                          </Button>
                        </Group>
                      </Paper>
                    )
                  })
                }
              </Stack>
            </Box>
          ) : null
        }
        <Box
          sx={value.length > 0 ? {
            borderTop: '1px solid #aaa',
            paddingTop: '1rem',
            marginTop: '1rem',
          } : {}}
        >
          <Stack>
            <Select
              label="Add Change Action"
              placeholder="Select a change to make..."
              data={
                remainingOptions.map((option) => ({
                  label: option.label,
                  value: option.value,
                }))
              }
              value={selectedOption}
              onChange={(value) => {
                setSelectedOption(value);
                setSelectedOptionInput(null);
              }}
              disabled={disabled}
            />
            {
              selectedOptionType == 'text' ? (
                <TextInput
                  label="Change to..."
                  value={selectedOptionInput}
                  onChange={(event) => setSelectedOptionInput(event.currentTarget.value)}
                  disabled={disabled}
                />
              ) : selectedOptionType == 'textarea' ? (
                <Textarea
                  label="Change to..."
                  value={selectedOptionInput}
                  onChange={(event) => setSelectedOptionInput(event.currentTarget.value)}
                  disabled={disabled}
                />
              ) : selectedOptionType == 'price' ? (
                <NumberInput
                  label="Change to..."
                  value={selectedOptionInput}
                  onChange={(value) => setSelectedOptionInput(value)}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                  formatter={(value) =>
                    !Number.isNaN(parseFloat(value || '0'))
                      ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      : '$ '
                  }
                  disabled={disabled}
                />
              ) : selectedOptionType == 'boolean' ? (
                <Switch
                  label="Change to on/off..."
                  checked={selectedOptionInput}
                  onChange={(event) => setSelectedOptionInput(event.currentTarget.checked)}
                  disabled={disabled}
                />
              ) : null
            }
            {
              selectedOption ? (
                <Button
                  onClick={onAddChange}
                  disabled={disabled}
                >
                  Add Change
                </Button>
              ) : null
            }
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}
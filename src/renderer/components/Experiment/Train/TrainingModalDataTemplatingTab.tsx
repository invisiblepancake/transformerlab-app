import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Textarea,
  Typography,
} from '@mui/joy';
import React, { useState, useEffect } from 'react';
import DatasetTableWithTemplate from 'renderer/components/Data/DatasetPreviewWithTemplate';
import DatasetTable from 'renderer/components/Data/DatasetTable';
import * as chatAPI from 'renderer/lib/transformerlab-api-sdk';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

function TrainingModalDataTemplatingTab({
  selectedDataset,
  currentDatasetInfo,
  templateData,
  injectIntoTemplate,
  experimentInfo,
  pluginId,
}) {
  const [template, setTemplate] = useState(
    'Instruction: Summarize the Following\nPrompt: {{dialogue}}\nGeneration: {{summary}}'
  );
  useEffect(() => {
    //initialize the template with the saved value
    if (templateData?.config?.formatting_template) {
      setTemplate(templateData?.config?.formatting_template);
    }
  }, []);

  const { data, error, isLoading, mutate } = useSWR(
    experimentInfo?.id &&
      pluginId &&
      chatAPI.Endpoints.Experiment.ScriptGetFile(
        experimentInfo?.id,
        pluginId,
        'index.json'
      ),
    fetcher
  );

  const parsedData = data ? JSON.parse(data) : null;

  function renderTemplate(templateType: string) {
    switch (templateType) {
      case 'alpaca':
        return (
          <>
            <FormControl>
              <FormLabel>Instruction</FormLabel>
              <Textarea
                required
                name="instruction_template"
                id="instruction"
                defaultValue={
                  templateData
                    ? templateData?.config?.instruction_template
                    : 'Instruction: {{instruction}}'
                }
                rows={5}
              />
              <FormHelperText>
                The instruction (usually the system message) to send to the
                model. For example in a summarization task, this could be
                "Summarize the following text:"
              </FormHelperText>
            </FormControl>
            <br />
            <FormControl>
              <FormLabel>Input</FormLabel>
              <Textarea
                required
                name="input_template"
                id="Input"
                defaultValue={
                  templateData
                    ? templateData?.config?.input_template
                    : '{{input}}'
                }
                rows={5}
              />
            </FormControl>
            <FormHelperText>
              The input to send to the model. For example in a summarization
              task, this could be the text to summarize.
            </FormHelperText>
            <br />
            <FormControl>
              <FormLabel>Output</FormLabel>
              <Textarea
                required
                name="output_template"
                id="output"
                defaultValue={
                  templateData
                    ? templateData?.config?.output_template
                    : '{{output}}'
                }
                rows={5}
              />
              <FormHelperText>
                The output to expect from the model. For example in a
                summarization task this could be the expected summary of the
                input text.
              </FormHelperText>
            </FormControl>
            {selectedDataset && (
              <>
                <Typography level="title-md" py={1}>
                  Preview Templated Output:
                </Typography>
                <DatasetTable datasetId={selectedDataset} />
              </>
            )}
          </>
        );
      case 'none':
        return <>No data template is required for this trainer</>;
      default:
        return (
          <>
            <FormControl>
              <textarea
                required
                name="formatting_template"
                id="instruction"
                rows={5}
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
              />
              <FormHelperText
                sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
              >
                This describes how the data is formatted when passed to the
                trainer. Use Jinja2 Standard String Templating format. For
                example:
                <br />
                <span style={{}}>
                  Summarize the following:
                  <br />
                  Prompt: &#123;&#123;prompt&#125;&#125;
                  <br />
                  Generation: &#123;&#123;generation&#125;&#125;
                </span>
              </FormHelperText>
            </FormControl>
            {selectedDataset && (
              <>
                <Typography level="title-md" py={1}>
                  Preview Templated Output:
                </Typography>
                <DatasetTableWithTemplate datasetId={selectedDataset} />
              </>
            )}
          </>
        );
    }
  }

  return (
    <Box
      sx={{
        overflow: 'auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {parsedData?.training_template_format !== 'none' && (
        <>
          <Alert sx={{ mt: 1 }} color="danger">
            <FormControl>
              <Typography level="title-md" mt={0} pb={1}>
                Available Fields in <u>{selectedDataset}</u> Dataset
              </Typography>
              <Box sx={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                {/* // For each key in the currentDatasetInfo.features object,
  display it: */}
                {(!currentDatasetInfo?.features ||
                  currentDatasetInfo?.success == 'false') &&
                  'No fields available'}
                {currentDatasetInfo?.features &&
                  Object.keys(currentDatasetInfo?.features).map((key) => (
                    <>
                      <Chip
                        color="success"
                        onClick={() => {
                          injectIntoTemplate(key);
                        }}
                      >
                        {key}
                      </Chip>
                      &nbsp;
                    </>
                  ))}
              </Box>

              {selectedDataset && (
                <FormHelperText>
                  Use the field names above, surrounded by
                  &#123;&#123;&#125;&#125; in the template below
                </FormHelperText>
              )}
            </FormControl>
          </Alert>
        </>
      )}
      <Typography level="title-md" mt={2} mb={0.5}>
        Template
      </Typography>
      {renderTemplate(parsedData?.training_template_format)}
    </Box>
  );
}

export default TrainingModalDataTemplatingTab;
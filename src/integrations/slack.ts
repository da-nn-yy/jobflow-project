export interface SlackBlock {
  type: string;
  text?: { type: string; text: string };
}

export function formatRunFailureMessage(runId: string, jobName: string, reason: string): SlackBlock[] {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Job run failed*\n• Run: \`${runId}\`\n• Job: ${jobName}\n• Reason: ${reason}`,
      },
    },
  ];
}

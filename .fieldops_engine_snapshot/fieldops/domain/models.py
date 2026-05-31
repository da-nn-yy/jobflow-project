from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Any
from .enums import TaskStatus, WorkflowState

class TaskDefinition(BaseModel):
    id: str
    name: str
    handler: str
    timeout_ms: int = 30_000
    optional: bool = False
    depends_on: list[str] = Field(default_factory=list)

class PlaybookDefinition(BaseModel):
    id: str
    name: str
    version: int = 1
    description: str = ""
    tasks: list[TaskDefinition]
    metadata: dict[str, str] = Field(default_factory=dict)

class TaskRun(BaseModel):
    id: str
    run_id: str
    definition_task_id: str
    handler: str
    status: TaskStatus = TaskStatus.QUEUED
    attempt: int = 0
    started_at: str | None = None
    finished_at: str | None = None
    output: dict[str, Any] = Field(default_factory=dict)
    error_message: str | None = None

class WorkOrderRun(BaseModel):
    id: str
    playbook_id: str
    workflow_id: str
    status: WorkflowState
    started_at: str
    finished_at: str | None = None
    trigger: str
    input: dict[str, Any] = Field(default_factory=dict)

class WorkflowInstance(BaseModel):
    id: str
    playbook_id: str
    run_id: str
    state: WorkflowState
    context: dict[str, Any] = Field(default_factory=dict)
    tasks: list[TaskRun] = Field(default_factory=list)
    version: int = 1
    created_at: str
    updated_at: str

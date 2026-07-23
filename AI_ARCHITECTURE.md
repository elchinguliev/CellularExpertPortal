\# AI Assistant Architecture and Data Flow



This document explains how the AI assistant works in the Cellular Expert support portal, including how documentation is stored, how the AI retrieves information, how answers are generated, and how AI activity is logged for admin insights.



\## 1. High-Level AI Flow



The AI assistant works as a Retrieval-Augmented Generation (RAG) system.



The main flow is:



1\. Documentation is stored in PostgreSQL.

2\. The AI backend loads documentation from PostgreSQL.

3\. Documentation is split into smaller chunks.

4\. Chunks are embedded and stored in the local Chroma vector database.

5\. When a user asks a question, the AI backend searches the vector database for the most relevant documentation chunks.

6\. The retrieved chunks are passed to the local LLM.

7\. The LLM generates an answer based on the retrieved documentation.

8\. The AI response is returned to the frontend with answer, confidence, sources, ticket status, and possible image references.

9\. The AI interaction is logged into PostgreSQL for admin insights.



\## 2. Main AI Components



\### Frontend



The React frontend provides the user interface where clients can ask questions to the AI assistant.



It sends user questions to the AI backend endpoint:



```text

POST /ask

```



The frontend receives and displays:



\- AI answer

\- confidence score

\- retrieved sources

\- ticket-needed status

\- ticket draft information

\- image references if available



\### AI Backend



The AI backend is a FastAPI service running on port 8000.



Main responsibilities:



\- receive user questions

\- retrieve relevant documentation chunks

\- call the local or cloud LLM

\- return grounded answers

\- prepare ticket drafts when needed

\- log AI activity for admin insights

\- rebuild the vector index when documentation changes



\### PostgreSQL Database



PostgreSQL stores:



\- documentation text

\- AI question logs

\- user activity logs

\- ticket-related data

\- image metadata or image mapping when available



\### Vector Database



ChromaDB is used as the local vector database.



It stores embeddings of documentation chunks and is used to find the most relevant documentation for each user question.



\### LLM



The current local model is used through Ollama.



The model receives the retrieved documentation context and generates the final answer.



\## 3. AI Data Flow Diagram



```text

User question

&#x20;    |

&#x20;    v

React frontend

&#x20;    |

&#x20;    v

POST /ask

&#x20;    |

&#x20;    v

FastAPI AI backend

&#x20;    |

&#x20;    v

Retrieve relevant chunks from Chroma vector database

&#x20;    |

&#x20;    v

Send retrieved context + user question to LLM

&#x20;    |

&#x20;    v

Generate grounded answer

&#x20;    |

&#x20;    v

Return answer, confidence, sources, ticket status, and image references

&#x20;    |

&#x20;    v

Log AI interaction into PostgreSQL

&#x20;    |

&#x20;    v

Admin insights can use the logged data

```



\## 4. Data Storage



The AI assistant uses PostgreSQL and ChromaDB for different purposes.



\### PostgreSQL



PostgreSQL is the main shared database. The AI backend reads documentation from PostgreSQL and stores AI activity there.



Main AI-related tables:



\- `documents` — stores documentation content used by the AI

\- `ai\_question\_logs` — stores user questions, confidence, answer status, retrieved document, product, and ticket-needed status

\- `user\_activity\_logs` — stores user activity events for tracking/reporting

\- `document\_images` — expected mapping table for images related to documentation answers

\- `synced\_images` — stores synced image files, but currently does not directly map images to document sections



\### ChromaDB



ChromaDB stores vector embeddings of documentation chunks.



It is used only for semantic search/retrieval. It does not replace PostgreSQL.



When documentation changes in PostgreSQL, the vector index should be rebuilt using:



```text

POST /admin/rebuild-index

```



\## 5. AI Logging and Admin Insights



Every AI question can be logged into PostgreSQL.



The AI backend stores information such as:



\- user name

\- question

\- generated answer

\- confidence score

\- whether a ticket was needed

\- top retrieved document

\- top retrieved section

\- product

\- number of retrieved sources

\- answer status

\- response time if available



This data can be used for admin insights.



Useful admin insight examples:



\- most asked questions

\- questions with low confidence

\- questions that often need support

\- products users ask about most often

\- documents retrieved most often

\- possible documentation gaps

\- topics that may need clearer documentation



A possible documentation gap can be detected when users repeatedly ask similar questions and the AI confidence is low or ticket-needed status is true.




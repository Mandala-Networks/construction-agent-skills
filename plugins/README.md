# Harness adapters

The canonical behavior lives in the skills directory and remains
harness-agnostic. Adapters for a particular agent runtime should translate its
packaging and authentication conventions without changing the construction
decision rules.

An adapter is ready only when it can run the same benchmark fixtures and emit
the shared result schema.


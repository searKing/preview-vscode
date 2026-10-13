==========================
reStructuredText (#111)
==========================

:Author: preview-vscode
:Version: 1.0

Inline markup
=============

Some *emphasis*, **strong**, ``inline literal``, a `link <https://github.com/searKing/preview-vscode>`_,
a reference to `Tables`_ and a footnote [#]_.

.. [#] The footnote.

Lists
=====

- Bullet item
- Bullet item 2

  Paragraph 2 of item 2.

1. Enumerated item
2. Enumerated item 2

#. Auto-enumerated item
#. Auto-enumerated item 2

Term
    Definition, indented by 4 spaces.

Blocks
======

.. note::

   This is a note.

.. warning::

   This is a warning.

.. code-block:: python

   def hello():
       print("hello")

A literal block::

    $ echo literal

A paragraph before a block quote.

    A block quote.

    -- Author

| Line block
|     indented line

Tables
======

+-------+-------+
| Grid  | Table |
+=======+=======+
| 1     | 2     |
+-------+-------+

=====  =====
Simple Table
------------
x      y
=====  =====
1      2
=====  =====

.. image:: media/hello.gif
   :alt: hello

Sphinx
======

Directives and roles of Sphinx are shown as source, e.g. :ref:`a reference` and :py:func:`hello`:

.. toctree::
   :maxdepth: 2

   index

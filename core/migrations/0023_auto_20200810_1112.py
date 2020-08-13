# Generated by Django 2.2.13 on 2020-08-10 11:12

from django.db import migrations

from json.decoder import JSONDecodeError

from core import query

def generate_aliases(apps, schema_editor):
    """
    For each existing operation, generate aliases for the returned columns
    """
    Operation = apps.get_model('core', 'Operation')
    SourceColumnMap = apps.get_model('core', 'SourceColumnMap')
    OperationDataColumnAlias = apps.get_model('core', 'OperationDataColumnAlias')
    operations = Operation.objects.all()

    for operation in operations:
        try:
            operation.operationdatacolumnalias_set.all().delete()
            count, data = query.query_table(operation, 1, 0, estimate_count=True)
            data_column_keys = data[0].keys()
            first_step = operation.operationstep_set.order_by('step_id')[0]
            columns = SourceColumnMap.objects.filter(source=first_step.source, name__in=data_column_keys)

            for column in data_column_keys:
                column_object = columns.filter(name=column).first()
                alias = OperationDataColumnAlias.objects.create(operation=operation, column_name=column)
                alias.column_alias = column_object.alias if column_object else column
                alias.save()
        except:
            first_step = operation.operationstep_set.order_by('step_id')[0]
            if first_step:
                columns = SourceColumnMap.objects.filter(source=first_step.source, name__in=data_column_keys)

                for column in columns:
                    alias = OperationDataColumnAlias.objects.create(operation=operation, column_name=column.name)
                    alias.column_alias = column.alias
                    alias.save()


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0022_auto_20200810_1046'),
    ]

    operations = [
        migrations.RunPython(generate_aliases)
    ]

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PersonService } from './person.service';
import { CreatePersonDto, UpdatePersonDto, PersonQueryDto } from './dto/person.dto';

@Controller('api/people')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreatePersonDto) {
    return this.personService.create(createDto);
  }

  @Get()
  findAll(@Query() query: PersonQueryDto) {
    return this.personService.findAll(query);
  }

  @Get('statistics')
  getStatistics() {
    return this.personService.getStatistics();
  }

  @Get('high-priority')
  getHighPriorityList() {
    return this.personService.getHighPriorityList();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePersonDto) {
    return this.personService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.personService.remove(id);
  }
}
